# Generated by Django 5.1.2 on 2024-10-21 17:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='email',
            name='votes_legitimate',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='email',
            name='votes_phishing',
            field=models.IntegerField(default=0),
        ),
    ]