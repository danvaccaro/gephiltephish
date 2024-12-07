# Generated by Django 5.1.3 on 2024-11-26 16:51

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_rename_content_email_body_email_subject'),
    ]

    operations = [
        migrations.RenameField(
            model_name='email',
            old_name='body',
            new_name='content',
        ),
        migrations.RenameField(
            model_name='email',
            old_name='sender',
            new_name='sender_domain',
        ),
        migrations.AddField(
            model_name='email',
            name='date',
            field=models.CharField(default=django.utils.timezone.now, max_length=100),
            preserve_default=False,
        ),
    ]
