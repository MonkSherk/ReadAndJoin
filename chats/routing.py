from django.urls import re_path
from .consumer import ChatConsumer

websocket_urlpatterns = [
    re_path(r'ws/chats/(?P<conversation_id>\d+)/$', ChatConsumer.as_asgi()),
]
