import secrets
import string
from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=False)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    confirmation_code = models.CharField(
        max_length=6,
        unique=True,
        default='000000',
        editable=False,
        null=True,
        blank=True
    )

    @staticmethod
    def generate_confirmation_code():
        """
        Генерирует уникальный 6-значный код подтверждения с использованием
        криптографически стойкого генератора.
        """
        while True:
            code = ''.join(secrets.choice(string.digits) for _ in range(6))
            if not User.objects.filter(confirmation_code=code).exists():
                return code

    def save(self, *args, **kwargs):
        # Генерация кода только при создании нового пользователя
        if self._state.adding and (not self.confirmation_code or self.confirmation_code == '000000'):
            self.confirmation_code = self.generate_confirmation_code()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username

class UserTagSubscription(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='tag_subscriptions'
    )
    tag_name = models.CharField(max_length=50)
    subscribed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'tag_name')

    def __str__(self):
        return f"{self.user.username} subscribed to {self.tag_name}"
