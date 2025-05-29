from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from rest_framework import status
from .models import Post, Comment, LikeDislike

User = get_user_model()

class PostTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(email='test@example.com', username='testuser', password='testpass')
        self.client.login(email='test@example.com', password='testpass')
        self.post = Post.objects.create(user=self.user, title='Test Post', content='Test Content')

    def test_post_list(self):
        response = self.client.get('/api/posts/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_user_posts(self):
        response = self.client.get(f'/api/users/{self.user.id}/posts/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_like_dislike(self):
        response = self.client.post(f'/api/posts/{self.post.id}/like/', {'action': 'like'}, content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        like = LikeDislike.objects.get(user=self.user, post=self.post)
        self.assertTrue(like.is_like)

class CommentTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(email='test@example.com', username='testuser', password='testpass')
        self.client.login(email='test@example.com', password='testpass')
        self.post = Post.objects.create(user=self.user, title='Test Post', content='Test Content')

    def test_comment_create(self):
        response = self.client.post(f'/api/posts/{self.post.id}/comments/', {'content': 'Test Comment'}, content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)