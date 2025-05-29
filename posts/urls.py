from django.urls import path
from .views import (
    PostListCreateView,
    PostRetrieveUpdateDestroyView,
    CommentCreateView,
    CommentEditView,
    UserPostsView,
    LikeDislikeView,
)

urlpatterns = [
    path('', PostListCreateView.as_view(), name='post_list_create'),
    path('<int:pk>/', PostRetrieveUpdateDestroyView.as_view(), name='post_detail'),

    # Создание комментария
    path('<int:pk>/comments/', CommentCreateView.as_view(), name='comment_create'),
    # Редактирование/удаление комментария
    path(
        '<int:post_pk>/comments/<int:pk>/',
        CommentEditView.as_view(),
        name='comment_edit'
    ),

    path('<int:pk>/like/', LikeDislikeView.as_view(), name='post_like_dislike'),
    path('users/<int:user_id>/posts/', UserPostsView.as_view(), name='user_posts'),
]
