# Generated by Django 5.1.2 on 2024-10-21 17:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_email_votes_legitimate_email_votes_phishing'),
    ]

    operations = [
        migrations.AddField(
            model_name='email',
            name='sender',
            field=models.CharField(default='default_sender', max_length=100),
        ),
    ]
