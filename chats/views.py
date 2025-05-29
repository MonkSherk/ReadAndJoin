from rest_framework import generics, serializers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from .models import Conversation, Message
from .serializers import (
    ConversationSerializer,
    ConversationListSerializer,     # ← новый
    MessageSerializer,
)
from notifications.models import Notification


# ──────────────────────────────────────────────────────────────
# LIST  (GET /api/chats/)  +  CREATE (POST /api/chats/)
# ──────────────────────────────────────────────────────────────
class ConversationListCreateView(generics.ListCreateAPIView):
    """
    GET  → список бесед (без вложенных messages, чтобы не тянуть лишнее)
    POST → создать диалог или вернуть существующий, если уже есть
    """
    permission_classes = [IsAuthenticated]
    serializer_class   = ConversationListSerializer     # для метода GET

    # общий queryset
    def get_queryset(self):
        u = self.request.user
        return (Conversation.objects
                .select_related('initiator', 'receiver')
                .filter(Q(initiator=u) | Q(receiver=u))
                .order_by('-created_at'))

    def get_serializer_context(self):
        return {'request': self.request}

    # ─── POST переопределяем полностью ───
    def post(self, request, *args, **kwargs):
        receiver_id = request.data.get('receiver_id')
        if not receiver_id:
            raise serializers.ValidationError({'receiver_id': 'required'})

        user     = request.user
        receiver = int(receiver_id)

        # ищем уже существующий диалог в любом направлении
        conv = (Conversation.objects
                .filter(Q(initiator=user, receiver_id=receiver) |
                        Q(initiator_id=receiver, receiver=user))
                .select_related('initiator', 'receiver')
                .first())

        if conv:
            data = ConversationSerializer(conv, context=self.get_serializer_context()).data
            return Response(data, status=status.HTTP_200_OK)

        # создаём новый
        serializer = ConversationSerializer(
            data={'receiver_id': receiver},
            context=self.get_serializer_context()
        )
        serializer.is_valid(raise_exception=True)
        conv = serializer.save()

        # уведомление адресату
        Notification.objects.create(
            user       = conv.receiver,
            content    = f'{conv.initiator.username} wants to chat with you.',
            type       = Notification.NotificationType.INFO,
            target_url = f'/chats/{conv.id}'
        )
        async_to_sync(get_channel_layer().group_send)(
            f'notifications_{conv.receiver.id}',
            {'type': 'send_notification', 'notification_id': conv.id}
        )

        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ──────────────────────────────────────────────────────────────
# RETRIEVE / UPDATE  (GET|PATCH /api/chats/<id>/)
# ──────────────────────────────────────────────────────────────
class ConversationRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    """
    GET   → подробная инфа + messages
    PATCH → принять / отклонить запрос на чат
    """
    serializer_class   = ConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        u = self.request.user
        return (Conversation.objects
                .select_related('initiator', 'receiver')
                .prefetch_related('messages__sender')
                .filter(Q(initiator=u) | Q(receiver=u)))

    def get_serializer_context(self):
        return {'request': self.request}

    def perform_update(self, serializer):
        conv = serializer.save()
        text = (f'{conv.receiver.username} accepted your chat request.'
                if conv.is_approved
                else f'{conv.receiver.username} declined your chat request.')

        Notification.objects.create(
            user       = conv.initiator,
            content    = text,
            type       = Notification.NotificationType.INFO,
            target_url = f'/chats/{conv.id}'
        )
        async_to_sync(get_channel_layer().group_send)(
            f'notifications_{conv.initiator.id}',
            {'type': 'send_notification', 'notification_id': conv.id}
        )


# ──────────────────────────────────────────────────────────────
# CREATE MESSAGE  (POST /api/chats/<id>/messages/)
# ──────────────────────────────────────────────────────────────
class MessageCreateView(generics.CreateAPIView):
    serializer_class   = MessageSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        conv = Conversation.objects.select_related('initiator', 'receiver').get(id=self.kwargs['pk'])
        if not conv.is_approved:
            raise serializers.ValidationError('Conversation not approved')

        msg = serializer.save(conversation=conv, sender=self.request.user)

        # уведомление получателю
        receiver = conv.initiator if conv.receiver == self.request.user else conv.receiver
        Notification.objects.create(
            user       = receiver,
            content    = f'New message from {self.request.user.username}',
            type       = Notification.NotificationType.INFO,
            target_url = f'/chats/{conv.id}'
        )
