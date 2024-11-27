from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import Email

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'email')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class EmailSerializer(serializers.ModelSerializer):
    user_vote = serializers.BooleanField(read_only=True)
    user_vote_type = serializers.CharField(read_only=True)
    is_mine = serializers.BooleanField(read_only=True)
    urls = serializers.JSONField(required=False, default=list)

    class Meta:
        model = Email
        fields = ('id', 'sender_domain', 'subject', 'content', 'urls',
                 'votes_phishing', 'votes_legitimate', 'user_vote',
                 'user_vote_type', 'is_mine')
