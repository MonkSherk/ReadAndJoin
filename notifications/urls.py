from django.urls import path
from .views import NotificationList, MarkAllRead

urlpatterns = [
    path('',               NotificationList.as_view(), name='notifications-list'),
    path('mark-all-read/', MarkAllRead.as_view(),      name='notifications-mark-all'),
]
