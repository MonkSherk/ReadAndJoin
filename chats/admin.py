from django.contrib import admin
from .models import Conversation, Message

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'initiator', 'receiver', 'is_approved', 'created_at']
    list_filter = ['is_approved', 'created_at']
    search_fields = ['initiator__username', 'receiver__username']

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['conversation', 'sender', 'content', 'created_at']
    list_filter = ['created_at']
    search_fields = ['content']