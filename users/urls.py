# users/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # базовые
    path("register/", views.RegisterView.as_view(), name="users-register"),
    path("confirm-email/", views.ConfirmEmailView.as_view(), name="users-confirm-email"),
    path("login/", views.LoginView.as_view(), name="users-login"),
    path("profile/", views.ProfileView.as_view(), name="users-profile"),
    path("analytics/", views.AnalyticsView.as_view(), name="users-analytics"),
    path("tags/", views.TagSubscriptionView.as_view(), name="users-tag-subscriptions"),
    # публичные
    path("<int:user_id>/profile/", views.PublicProfileView.as_view(), name="users-public-profile"),
    path(
        "<int:user_id>/analytics/",
        views.PublicAnalyticsView.as_view(),
        name="users-public-analytics",
    ),
]
