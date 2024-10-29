from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Email(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="submitted_emails")
    sender = models.CharField(max_length=100, default="default_sender")
    subject = models.CharField(max_length=100, default="default_subject")
    body = models.TextField()
    created_at = models.DateTimeField()
    votes_phishing = models.IntegerField(default=0)
    votes_legitimate = models.IntegerField(default=0)
    def __str__(self):
        return self.sender + " - " + self.subject
