from rest_framework import serializers
from .models import Conversation, Message
from users.serializers import ProfileSerializer
from users.models import User

class MessageSerializer(serializers.ModelSerializer):
    sender      = ProfileSerializer(read_only=True)
    sender_id   = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(),
                                                     write_only=True, source='sender')

    class Meta:
        model  = Message
        fields = ['id', 'conversation', 'sender', 'sender_id', 'content', 'created_at']
        read_only_fields = ['id', 'created_at']

class ConversationSerializer(serializers.ModelSerializer):
    initiator     = ProfileSerializer(read_only=True)
    receiver      = ProfileSerializer(read_only=True)
    messages      = MessageSerializer(many=True, read_only=True)
    receiver_id   = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(),
                                                       write_only=True, source='receiver')

    class Meta:
        model  = Conversation
        fields = [
            'id', 'initiator', 'receiver',
            'receiver_id', 'is_approved', 'created_at', 'messages'
        ]
        read_only_fields = ['id', 'created_at', 'messages', 'initiator']

    def create(self, validated_data):
        """инициатор = request.user (берём из контекста)"""
        validated_data['initiator'] = self.context['request'].user
        return super().create(validated_data)

class ConversationListSerializer(serializers.ModelSerializer):
    initiator = ProfileSerializer(read_only=True)
    receiver  = ProfileSerializer(read_only=True)

    class Meta:
        model  = Conversation
        fields = ['id', 'initiator', 'receiver', 'is_approved', 'created_at']
