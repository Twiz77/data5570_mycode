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
    receiver_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = FriendRequest
        fields = ['id', 'sender', 'receiver', 'receiver_id', 'sender_details', 'receiver_details', 
                 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'sender', 'receiver']

    def validate_receiver_id(self, value):
        print(f"Validating receiver_id: {value}")
        try:
            receiver = Player.objects.get(id=value)
            print(f"Found receiver: {receiver}")
            return value
        except Player.DoesNotExist:
            print(f"Receiver with ID {value} not found")
            raise serializers.ValidationError("Invalid receiver ID")

    def create(self, validated_data):
        print(f"Creating friend request with data: {validated_data}")
        receiver_id = validated_data.pop('receiver_id')
        try:
            receiver = Player.objects.get(id=receiver_id)
            validated_data['receiver'] = receiver
            return super().create(validated_data)
        except Exception as e:
            print(f"Error creating friend request: {str(e)}")
            raise serializers.ValidationError(str(e))
