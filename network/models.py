from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Post(models.Model):
    poster = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    content = models.CharField(max_length=500)
    timestamp = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        return {
            'poster': self.poster.username,
            'poster_id': self.poster.id,
            'content': self.content,
            'timestamp': self.timestamp.strftime("%b %d %Y, %I:%M %p")
        }

class Like(models.Model):
    liker = models.ForeignKey(User, on_delete=models.CASCADE, related_name="likes")
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="likes")

    class Meta:
        unique_together = ('liker', 'post')

class Follow(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name="following")
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name="followers")

    class Meta:
        unique_together = ('follower', 'following')