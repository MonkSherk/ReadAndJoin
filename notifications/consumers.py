import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from asgiref.sync import sync_to_async
from .models import Notification
from .serializers import NotificationSerializer


class NotificationConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        user = self.scope["user"]
        if user.is_anonymous:
            await self.close()
            return
        self.group_name = f"notifications_{user.id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, data, **kwargs):
        action = data.get("action")
        if action == "mark_as_read":
            await self._mark_read(data.get("notification_id"))
        elif action == "mark_all_read":                               # ★
            await self._mark_all_read()

    # ───── helpers (sync) ─────
    @sync_to_async
    def _mark_read(self, notif_id):
        Notification.objects.filter(id=notif_id, user=self.scope["user"]).update(is_read=True)

    @sync_to_async
    def _mark_all_read(self):
        Notification.objects.filter(user=self.scope["user"], is_read=False).update(is_read=True)

    # ───── событие из group_send ─────
    async def send_notification(self, event):
        notif = await sync_to_async(Notification.objects.get)(id=event["notification_id"])
        data  = NotificationSerializer(notif).data
        await self.send(text_data=json.dumps(data))
