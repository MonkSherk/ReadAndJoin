import re
from rest_framework import serializers
from users.models import User
from users.serializers import ProfileSerializer
from .models import Post, Comment, Tag, LikeDislike


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Tag
        fields = ['id', 'name']
        # ↓ убираем автоматический UniqueValidator
        extra_kwargs = {
            'name': {'validators': []}
        }


class LikeDislikeSerializer(serializers.ModelSerializer):
    user = ProfileSerializer(read_only=True)
    post = serializers.PrimaryKeyRelatedField(queryset=Post.objects.all())

    class Meta:
        model  = LikeDislike
        fields = ['id', 'user', 'post', 'is_like', 'created_at']
        read_only_fields = ['id', 'created_at']


class CommentSerializer(serializers.ModelSerializer):
    user    = ProfileSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        write_only=True,
        queryset=User.objects.all(),
        source='user'
    )
    replies = serializers.SerializerMethodField()

    class Meta:
        model  = Comment
        fields = [
            'id', 'post', 'user', 'user_id',
            'content', 'created_at', 'updated_at',
            'parent', 'replies'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_replies(self, obj):
        qs = obj.replies.all().order_by('created_at')
        return CommentSerializer(qs, many=True, context=self.context).data


class PostSerializer(serializers.ModelSerializer):
    user              = ProfileSerializer(read_only=True)
    tags              = TagSerializer(many=True)
    likes_count       = serializers.SerializerMethodField()
    dislikes_count    = serializers.SerializerMethodField()
    user_has_liked    = serializers.SerializerMethodField()
    user_has_disliked = serializers.SerializerMethodField()
    comments          = serializers.SerializerMethodField()   # только корневые

    class Meta:
        model  = Post
        fields = [
            'id', 'user', 'title', 'content', 'tags',
            'comments', 'created_at', 'updated_at',
            'likes_count', 'dislikes_count',
            'user_has_liked', 'user_has_disliked'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    # ───────── stats ─────────
    def get_likes_count(self, obj):
        return obj.likedislike_set.filter(is_like=True).count()

    def get_dislikes_count(self, obj):
        return obj.likedislike_set.filter(is_like=False).count()

    def get_user_has_liked(self, obj):
        user = self.context['request'].user
        return user.is_authenticated and obj.likedislike_set.filter(
            user=user, is_like=True).exists()

    def get_user_has_disliked(self, obj):
        user = self.context['request'].user
        return user.is_authenticated and obj.likedislike_set.filter(
            user=user, is_like=False).exists()

    # ───────── comments ─────────
    def get_comments(self, obj):
        roots = obj.comments.filter(parent__isnull=True).order_by('created_at')
        return CommentSerializer(roots, many=True, context=self.context).data

    # ───────── create / update ─────────
    def create(self, validated_data):
        tags_data = validated_data.pop('tags', [])
        content   = validated_data.get('content', '')
        post = Post.objects.create(**validated_data)

        # авто-теги по #ключевым_словам
        for kw in re.findall(r'#(\w+)', content):
            tag, _ = Tag.objects.get_or_create(name=kw.lower())
            post.tags.add(tag)

        for tag_data in tags_data:
            tag, _ = Tag.objects.get_or_create(name=tag_data['name'])
            post.tags.add(tag)

        return post

    def update(self, instance, validated_data):
        tags_data = validated_data.pop('tags', [])
        instance.title   = validated_data.get('title',   instance.title)
        instance.content = validated_data.get('content', instance.content)
        instance.save()

        instance.tags.clear()
        # обновляем авто- и пользовательские теги
        for kw in re.findall(r'#(\w+)', instance.content):
            tag, _ = Tag.objects.get_or_create(name=kw.lower())
            instance.tags.add(tag)

        for tag_data in tags_data:
            tag, _ = Tag.objects.get_or_create(name=tag_data['name'])
            instance.tags.add(tag)

        return instance
