from django.http import Http404
from django.shortcuts import get_object_or_404
from rest_framework import (
    generics, permissions, status, exceptions, filters
)
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView
from rest_framework.response import Response
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django_filters.rest_framework import DjangoFilterBackend

from .models import Post, Comment, LikeDislike
from .serializers import PostSerializer, CommentSerializer
from notifications.models import Notification
from users.models import UserTagSubscription


# ───────── posts ─────────
class PostListCreateView(generics.ListCreateAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['tags__name']
    search_fields = ['title', 'content']

    def perform_create(self, serializer):
        post = serializer.save(user=self.request.user)
        channel_layer = get_channel_layer()

        # уведомляем подписчиков на теги
        for tag in post.tags.all():
            subs = UserTagSubscription.objects.filter(
                tag_name=tag.name
            ).exclude(user=self.request.user)

            for sub in subs:
                notif = Notification.objects.create(
                    user=sub.user,
                    content=f"New post with tag '{tag.name}': {post.title}",
                    type=Notification.NotificationType.TAG,
                    target_url=f'/posts/{post.id}'        # ← ссылка на пост
                )
                async_to_sync(channel_layer.group_send)(
                    f'notifications_{sub.user.id}',
                    {'type': 'send_notification',
                     'notification_id': notif.id}
                )

    def get_serializer_context(self):
        return {'request': self.request}


class PostRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_update(self, serializer):
        if serializer.instance.user != self.request.user:
            raise exceptions.PermissionDenied("You can only edit your own posts")
        serializer.save(user=self.request.user)

    def perform_destroy(self, instance):
        if instance.user != self.request.user:
            raise exceptions.PermissionDenied("You can only delete your own posts")
        instance.delete()

    def get_serializer_context(self):
        return {'request': self.request}


class UserPostsView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Post.objects.filter(user_id=self.kwargs['user_id'])

    def get_serializer_context(self):
        return {'request': self.request}


# ───────── like / dislike ─────────
class LikeDislikeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        post   = get_object_or_404(Post, id=pk)
        action = request.data.get('action')
        if action not in ['like', 'dislike', 'remove']:
            return Response({'detail': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)

        obj, _ = LikeDislike.objects.get_or_create(user=request.user, post=post)

        if action == 'remove':
            obj.delete()
        else:
            obj.is_like = (action == 'like')
            obj.save()

            # уведомление владельцу поста
            if request.user != post.user:
                notif = Notification.objects.create(
                    user=post.user,
                    content=f"{request.user.username} "
                            f"{'liked' if obj.is_like else 'disliked'} your post",
                    type=Notification.NotificationType.LIKE
                    if obj.is_like else Notification.NotificationType.DISLIKE,
                    target_url=f'/posts/{post.id}'
                )
                async_to_sync(get_channel_layer().group_send)(
                    f'notifications_{post.user.id}',
                    {'type': 'send_notification',
                     'notification_id': notif.id}
                )

        serializer = PostSerializer(post, context={'request': request})
        return Response(serializer.data)


# ───────── comments ─────────
class CommentCreateView(generics.CreateAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        post = get_object_or_404(Post, id=self.kwargs['pk'])
        parent_id = self.request.data.get('parent')
        parent = get_object_or_404(Comment, id=parent_id, post=post) if parent_id else None

        comment = serializer.save(user=self.request.user, post=post, parent=parent)

        # уведомление владельцу поста
        if self.request.user != post.user:
            notif = Notification.objects.create(
                user=post.user,
                content=f"{self.request.user.username} commented on your post",
                type=Notification.NotificationType.COMMENT,
                target_url=f'/posts/{post.id}'
            )
            async_to_sync(get_channel_layer().group_send)(
                f'notifications_{post.user.id}',
                {'type': 'send_notification',
                 'notification_id': notif.id}
            )


class CommentEditView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        obj = super().get_object()
        if obj.post_id != int(self.kwargs['post_pk']):
            raise Http404
        if obj.user != self.request.user and not self.request.user.is_staff:
            raise PermissionDenied("You do not have permission to edit this comment")
        return obj
