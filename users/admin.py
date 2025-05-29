from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserTagSubscription

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'is_active', 'date_joined']
    list_filter = ['is_active', 'is_staff', 'is_superuser']
    search_fields = ['username', 'email']

@admin.register(UserTagSubscription)
class UserTagSubscriptionAdmin(admin.ModelAdmin):
    list_display = ['user', 'tag_name', 'subscribed_at']
    list_filter = ['tag_name']
