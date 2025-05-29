# users/views.py
from django.db import transaction, models
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate
from rest_framework import generics, status, serializers as drf_serializers
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import User, UserTagSubscription
from .serializers import (
    RegisterSerializer,
    ConfirmEmailSerializer,
    LoginSerializer,
    ProfileSerializer,
    AnalyticsSerializer,
    TagSubscriptionSerializer,
)

from posts.models import Post


# ───────── регистрация ─────────
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


# ───────── подтверждение email ─────────
class ConfirmEmailView(generics.GenericAPIView):
    serializer_class = ConfirmEmailSerializer
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tokens = serializer.save()
        return Response(
            {"detail": "Email подтверждён.", **tokens},
            status=status.HTTP_200_OK,
        )


# ───────── вход ─────────
class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tokens = serializer.create(serializer.validated_data)
        return Response({"detail": "Успешный вход.", **tokens}, status=status.HTTP_200_OK)


# ───────── мой профиль ─────────
class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


# ───────── моя аналитика ─────────
class AnalyticsView(generics.GenericAPIView):
    serializer_class = AnalyticsSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        analytics = self.get_serializer().get_analytics(request.user)
        return Response(analytics)


# ───────── подписки на теги ─────────
class TagSubscriptionView(generics.ListCreateAPIView):
    serializer_class = TagSubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.request.user.tag_subscriptions.all()

    def perform_create(self, serializer):
        tag_name = serializer.validated_data["tag_name"]
        subscription, created = UserTagSubscription.objects.get_or_create(
            user=self.request.user, tag_name=tag_name
        )
        if not created:
            raise drf_serializers.ValidationError({"detail": "Уже подписаны на этот тег."})


# ════════════════════════════════════════════════════════════════
#                       НОВЫЕ ПУБЛИЧНЫЕ API
# ════════════════════════════════════════════════════════════════


class PublicProfileView(generics.RetrieveAPIView):
    """
    GET /api/users/<id>/profile/
    Публичный профиль любого пользователя.
    """

    queryset = User.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [AllowAny]
    lookup_url_kwarg = "user_id"


class PublicAnalyticsView(generics.GenericAPIView):
    """
    GET /api/users/<id>/analytics/
    Публичная статистика любого пользователя.
    """

    serializer_class = AnalyticsSerializer
    permission_classes = [AllowAny]
    lookup_url_kwarg = "user_id"

    def get(self, request, *args, **kwargs):
        user = get_object_or_404(User, id=kwargs["user_id"])
        posts = Post.objects.filter(user=user)

        top_tags = (
            posts.values_list("tags__name", flat=True)
            .exclude(tags__name__isnull=True)
            .exclude(tags__name__exact="")
        )
        top_tags = list(dict.fromkeys(top_tags))[:3]

        avg_len = int(
            posts.aggregate(avg_len=models.Avg(models.functions.Length("content")))["avg_len"]
            or 0
        )

        data = {
            "posts_count": posts.count(),
            "avg_post_length": avg_len,
            "top_tags": top_tags,
            "last_activity": posts.order_by("-updated_at").first().updated_at
            if posts.exists()
            else None,
        }
        return Response(data)
