import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth.models import AnonymousUser

from .models import Conversation, Message
from .serializers import MessageSerializer


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.conversation_id = self.scope["url_route"]["kwargs"]["conversation_id"]
        self.group_name = f"chat_{self.conversation_id}"

        user = await self.user_from_token()
        if not user.is_authenticated:
            return await self.close()

        conv = await self.get_conversation()
        if (
            conv
            and conv.is_approved
            and user in {conv.initiator, conv.receiver}
        ):
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()
            self.user = user
        else:
            await self.close()

    async def disconnect(self, _):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        content = data.get("content")

        if not content.strip():
            return

        msg = await self.save_message(self.user, content)

        # сериализуем EXACTLY так же, как в REST
        payload = await self.serialize_message(msg)

        await self.channel_layer.group_send(
            self.group_name, {"type": "chat.message", "payload": payload}
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event["payload"]))

    # ───────── helpers (sync→async) ─────────
    @database_sync_to_async
    def user_from_token(self):
        try:
            token = self.scope["query_string"].decode().split("token=")[1]
            jwt = JWTAuthentication()
            return jwt.get_user(jwt.get_validated_token(token))
        except Exception:
            return AnonymousUser()

    @database_sync_to_async
    def get_conversation(self):
        try:
            return Conversation.objects.select_related(
                "initiator", "receiver"
            ).get(id=self.conversation_id)
        except Conversation.DoesNotExist:
            return None

    @database_sync_to_async
    def save_message(self, user, content):
        conv = Conversation.objects.get(id=self.conversation_id)
        return Message.objects.create(conversation=conv, sender=user, content=content)

    @database_sync_to_async
    def serialize_message(self, msg):
        # context нужен, чтобы ссылки на аватар, if any, были абсолютными
        return MessageSerializer(msg, context={"request": None}).data
