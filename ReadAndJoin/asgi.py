import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import chats.routing
import notifications.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ReadAndJoin.settings')

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': AuthMiddlewareStack(
        URLRouter(
            chats.routing.websocket_urlpatterns +
            notifications.routing.websocket_urlpatterns
        )
    ),
})