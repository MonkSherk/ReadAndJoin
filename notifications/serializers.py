from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Notification
        fields = [
            "id",
            "content",
            "type",
            "target_url",
            "created_at",
            "is_read",
        ]
