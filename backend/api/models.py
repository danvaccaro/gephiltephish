from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Email(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="submitted_emails")
    sender_domain = models.CharField(max_length=100, default="default_sender")
    subject = models.CharField(max_length=100, default="default_subject")
    date = models.CharField(max_length=100)  # Store as string to preserve exact format
    content = models.TextField()
    urls = models.JSONField(default=list)  # Store extracted URLs as a JSON array
    created_at = models.DateTimeField(auto_now_add=True)  # Auto-populate on creation
    votes_phishing = models.IntegerField(default=0)
    votes_legitimate = models.IntegerField(default=0)
    
    def __str__(self):
        return self.sender_domain + " - " + self.subject

class Vote(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    email = models.ForeignKey(Email, on_delete=models.CASCADE)
    is_phishing = models.BooleanField()  # True for phishing, False for legitimate
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'email')  # Ensures one vote per user per email
