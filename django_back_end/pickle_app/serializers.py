from rest_framework import serializers
from .models import Player, Location, Connection, FriendRequest
from django.contrib.auth.models import User

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['location_id', 'courts', 'city', 'state']

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password']
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

class PlayerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    location = LocationSerializer(read_only=True)
    location_id = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.all(),
        source='location',
        write_only=True,
        required=False
    )
    location_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Player
        fields = [
            'id', 'user', 'first_name', 'last_name', 'email', 'phone_number',
            'skill_rating', 'location', 'location_id', 'location_display', 
            'experience_years', 'availability', 'preferred_play', 
            'notifications_enabled', 'email_notifications',
            'push_notifications', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_location_display(self, obj):
        return obj.get_location_display()

class ConnectionSerializer(serializers.ModelSerializer):
    player1_details = PlayerSerializer(source='player1', read_only=True)
    player2_details = PlayerSerializer(source='player2', read_only=True)
    
    class Meta:
        model = Connection
        fields = ['id', 'player1', 'player2', 'player1_details', 'player2_details', 'created_at']
        read_only_fields = ['id', 'created_at']

class FriendRequestSerializer(serializers.ModelSerializer):
    sender_details = PlayerSerializer(source='sender', read_only=True)
    receiver_details = PlayerSerializer(source='receiver', read_only=True)
    
    class Meta:
        model = FriendRequest
        fields = ['id', 'sender', 'receiver', 'sender_details', 'receiver_details', 
                 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
