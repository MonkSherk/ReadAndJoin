from django.urls import path
from .views import (
    ConversationListCreateView,
    ConversationRetrieveUpdateView,
    MessageCreateView,
)

urlpatterns = [
    path('',               ConversationListCreateView.as_view(), name='conversation_list_create'),
    path('<int:pk>/',      ConversationRetrieveUpdateView.as_view(), name='conversation_detail'),
    path('<int:pk>/messages/', MessageCreateView.as_view(),        name='message_create'),
]
