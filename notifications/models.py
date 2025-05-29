from django.db import models
from django.conf import settings


class Notification(models.Model):
    class NotificationType(models.TextChoices):
        LIKE    = "LIKE"
        DISLIKE = "DISLIKE"
        COMMENT = "COMMENT"
        TAG     = "TAG"
        INFO    = "INFO"

    user       = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications"
    )
    content    = models.CharField(max_length=255)
    type       = models.CharField(max_length=16, choices=NotificationType.choices)
    target_url = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_read    = models.BooleanField(default=False)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return f"Notification #{self.id} → {self.user} ({self.type})"
