from django.conf import settings
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import transaction
from django.utils import timezone
from django.db.models import Count, Avg
from django.db.models.functions import Length
from datetime import timedelta
from posts.models import Post
from .models import User, UserTagSubscription

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'avatar']
        extra_kwargs = {'avatar': {'required': False, 'allow_null': True}}

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Пароли не совпадают.'})
        return data

    @transaction.atomic
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        avatar = validated_data.pop('avatar', None)
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=password,
            is_active=False,
            avatar=avatar
        )
        try:
            send_mail(
                subject='Код подтверждения ReadAndJoin',
                message=f'Ваш код подтверждения: {user.confirmation_code}',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
        except Exception:
            # При ошибке отправки почты пользователь создаётся, но email может быть неподтверждён
            pass
        return user

class ConfirmEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    confirmation_code = serializers.CharField(min_length=6, max_length=6)
    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)

    def validate(self, data):
        try:
            user = User.objects.get(
                email=data['email'],
                confirmation_code=data['confirmation_code']
            )
        except User.DoesNotExist:
            raise serializers.ValidationError({'detail': 'Неверный email или код подтверждения.'})
        if user.is_active:
            raise serializers.ValidationError({'detail': 'Email уже подтверждён.'})
        data['user'] = user
        return data

    @transaction.atomic
    def save(self):
        user = self.validated_data['user']
        user.is_active = True
        user.confirmation_code = None
        user.save(update_fields=['is_active', 'confirmation_code'])
        refresh = RefreshToken.for_user(user)
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        }

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)

    def validate(self, data):
        user = authenticate(
            username=data.get('username'),
            password=data.get('password')
        )
        if user is None:
            raise serializers.ValidationError({'detail': 'Неверное имя пользователя или пароль.'})
        if not user.is_active:
            raise serializers.ValidationError({'detail': 'Учётная запись не активирована.'})
        data['user'] = user
        return data

    def create(self, validated_data):
        user = validated_data['user']
        refresh = RefreshToken.for_user(user)
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        }

class ProfileSerializer(serializers.ModelSerializer):
    subscribed_tags = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'avatar', 'subscribed_tags']

    def get_subscribed_tags(self, obj):
        return list(obj.tag_subscriptions.values_list('tag_name', flat=True))

class TagSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserTagSubscription
        fields = ['tag_name']

class AnalyticsSerializer(serializers.Serializer):
    posts_count = serializers.IntegerField()
    avg_post_length = serializers.FloatField()
    top_tags = serializers.ListField(child=serializers.CharField())
    last_activity = serializers.DateTimeField(allow_null=True)

    def get_analytics(self, user):
        thirty_days_ago = timezone.now() - timedelta(days=30)
        recent = Post.objects.filter(user=user, created_at__gte=thirty_days_ago)
        posts_count = recent.count()
        avg_post_length = recent.aggregate(
            avg=Avg(Length('content'))
        )['avg'] or 0
        top_tags = (
            Post.objects.filter(user=user)
            .values('tags__name')
            .annotate(count=Count('tags__name'))
            .order_by('-count')[:5]
            .values_list('tags__name', flat=True)
        )
        last_activity = recent.order_by('-created_at').first().created_at if posts_count else None
        return {
            'posts_count': posts_count,
            'avg_post_length': round(avg_post_length, 2),
            'top_tags': list(top_tags),
            'last_activity': last_activity
        }
