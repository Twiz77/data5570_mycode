from django.shortcuts import render
from rest_framework import generics, viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import User, Player, Location, Connection, FriendRequest
from .serializers import UserSerializer, PlayerSerializer, LocationSerializer, ConnectionSerializer, FriendRequestSerializer
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.db import transaction
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required

# List and create users (GET and POST)
class UserListCreateAPIView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

# Retrieve, update, and delete a single user (GET, PUT, DELETE)
class UserRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the profile
        return obj.user == request.user

class PlayerViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing player profiles.
    """
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    # Temporarily allow unauthenticated access for development
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        """
        This view should return a list of all players
        for the currently authenticated user.
        """
        # For development, return all players
        return Player.objects.all()
    
    def perform_create(self, serializer):
        """
        Set the user when creating a new player profile.
        """
        # For development, we'll skip setting the user
        serializer.save()
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """
        Custom action to get the current user's profile.
        """
        # For development, return the first player
        player = Player.objects.first()
        if not player:
            return Response({"error": "No players found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(player)
        return Response(serializer.data)
    
    @action(detail=False, methods=['patch'])
    def update_preferences(self, request):
        """
        Custom action to update player preferences.
        """
        # For development, update the first player
        player = Player.objects.first()
        if not player:
            return Response({"error": "No players found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(player, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LocationViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing locations.
    """
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        """
        Optionally filter locations by city or state.
        """
        queryset = Location.objects.all()
        city = self.request.query_params.get('city', None)
        state = self.request.query_params.get('state', None)
        
        if city:
            queryset = queryset.filter(city__icontains=city)
        if state:
            queryset = queryset.filter(state__iexact=state)
            
        return queryset

# Connection and Friend Request Views
class ConnectionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing connections between players.
    """
    serializer_class = ConnectionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Return connections for the current user.
        """
        player = get_object_or_404(Player, user=self.request.user)
        return Connection.objects.filter(player1=player) | Connection.objects.filter(player2=player)
    
    def perform_create(self, serializer):
        """
        Create a connection between two players.
        """
        player = get_object_or_404(Player, user=self.request.user)
        other_player_id = self.request.data.get('other_player_id')
        
        if not other_player_id:
            raise serializers.ValidationError({"other_player_id": "This field is required."})
        
        other_player = get_object_or_404(Player, id=other_player_id)
        
        # Check if connection already exists
        if Connection.objects.filter(player1=player, player2=other_player).exists() or \
           Connection.objects.filter(player1=other_player, player2=player).exists():
            raise serializers.ValidationError({"detail": "Connection already exists."})
        
        # Create the connection
        serializer.save(player1=player, player2=other_player)

class FriendRequestViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing friend requests.
    """
    serializer_class = FriendRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Return friend requests for the current user.
        """
        player = get_object_or_404(Player, user=self.request.user)
        return FriendRequest.objects.filter(receiver=player, status='pending')
    
    def perform_create(self, serializer):
        """
        Create a friend request.
        """
        player = get_object_or_404(Player, user=self.request.user)
        receiver_id = self.request.data.get('receiver_id')
        
        if not receiver_id:
            raise serializers.ValidationError({"receiver_id": "This field is required."})
        
        receiver = get_object_or_404(Player, id=receiver_id)
        
        # Check if request already exists
        if FriendRequest.objects.filter(sender=player, receiver=receiver, status='pending').exists():
            raise serializers.ValidationError({"detail": "Friend request already sent."})
        
        # Check if connection already exists
        if Connection.objects.filter(player1=player, player2=receiver).exists() or \
           Connection.objects.filter(player1=receiver, player2=player).exists():
            raise serializers.ValidationError({"detail": "Connection already exists."})
        
        # Create the friend request
        serializer.save(sender=player, receiver=receiver)
    
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """
        Accept a friend request and create a connection.
        """
        friend_request = self.get_object()
        player = get_object_or_404(Player, user=request.user)
        
        # Verify the current user is the receiver
        if friend_request.receiver != player:
            return Response({"detail": "Not authorized to accept this request."}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        # Update the friend request status
        friend_request.status = 'accepted'
        friend_request.save()
        
        # Create a connection
        Connection.objects.create(
            player1=friend_request.sender,
            player2=friend_request.receiver
        )
        
        return Response({"detail": "Friend request accepted and connection created."})
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """
        Reject a friend request.
        """
        friend_request = self.get_object()
        player = get_object_or_404(Player, user=request.user)
        
        # Verify the current user is the receiver
        if friend_request.receiver != player:
            return Response({"detail": "Not authorized to reject this request."}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        # Update the friend request status
        friend_request.status = 'rejected'
        friend_request.save()
        
        return Response({"detail": "Friend request rejected."})

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        # Set first_name and last_name on the User object
        user.first_name = request.data.get('first_name', '')
        user.last_name = request.data.get('last_name', '')
        user.save()
        
        # Create a player profile for the user
        player = Player.objects.create(
            user=user,
            first_name=request.data.get('first_name', ''),
            last_name=request.data.get('last_name', ''),
            phone_number=request.data.get('phone_number', ''),
            email=user.email,  # Set the email field to match the user's email
            skill_rating=2.0  # Set default skill rating to 2.0 for new users
        )
        return Response({
            'id': user.id,
            'email': user.email,
            'player_id': player.id,
            'phone_number': player.phone_number  # Include phone number in response
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_user(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    # Special handling for dev user
    if email == 'dev@example.com' and password == 'devpassword':
        try:
            user = User.objects.get(email='dev@example.com')
            player = Player.objects.get(user=user)
            # Create or get the auth token
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'id': user.id,
                'email': user.email,
                'player_id': player.id,
                'token': token.key,
                'isAdmin': user.is_staff
            })
        except (User.DoesNotExist, Player.DoesNotExist):
            return Response({'error': 'Dev user not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Normal login flow
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not user.check_password(password):
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        player = Player.objects.get(user=user)
        # Create or get the auth token
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'id': user.id,
            'email': user.email,
            'player_id': player.id,
            'token': token.key,
            'isAdmin': user.is_staff
        })
    except Player.DoesNotExist:
        return Response({'error': 'Player profile not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])  # Temporarily allow unauthenticated access
def get_user_profile(request):
    """
    Get the profile data for the authenticated user.
    For development, returns the first player's profile.
    """
    try:
        # For development, get the first player instead of the authenticated user
        player = Player.objects.first()
        if not player:
            return Response({
                'error': 'No player profiles found'
            }, status=status.HTTP_404_NOT_FOUND)
            
        return Response({
            'first_name': player.first_name,
            'last_name': player.last_name,
            'email': player.email,
            'phone': player.phone_number,
            'rating': float(player.skill_rating),
            'location': player.get_location_display(),
            'availability': player.availability,
            'preferredPlay': player.preferred_play,
            'notifications': player.notifications_enabled,
            'emailNotifications': player.email_notifications,
            'pushNotifications': player.push_notifications,
        }, status=status.HTTP_200_OK)
    except Player.DoesNotExist:
        return Response({
            'error': 'Player profile not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_all_users(request):
    """
    Get all users in the format needed by the dashboard.
    This endpoint requires authentication.
    """
    try:
        # Get the current user's player profile
        current_player = Player.objects.filter(user=request.user).first()
        
        # Get all players with their related data, excluding the current user
        players = Player.objects.select_related('user', 'location').exclude(user=request.user)
        
        # Format the data for the dashboard
        dashboard_data = []
        for player in players:
            player_data = {
                'id': player.user.id,
                'first_name': player.first_name,
                'last_name': player.last_name,
                'email': player.email,
                'phone': player.phone_number,  # Note: dashboard expects 'phone' not 'phone_number'
                'rating': float(player.skill_rating),
                'location': f"{player.location.city}, {player.location.state}" if player.location else None,
                'availability': player.availability.split(',') if isinstance(player.availability, str) else (player.availability if isinstance(player.availability, list) else []),  # Handle both string and list
                'preferredPlay': player.preferred_play,
                'notifications': player.notifications_enabled,
                'emailNotifications': player.email_notifications,
                'pushNotifications': player.push_notifications,
                'isAdmin': player.user.is_staff,
                'created_at': player.created_at.isoformat()  # Format date for JSON
            }
            dashboard_data.append(player_data)
        
        return Response(dashboard_data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@permission_classes([permissions.IsAuthenticated])
def update_user_profile(request):
    """
    Update the profile data for the authenticated user.
    """
    try:
        # Get the player profile for the authenticated user
        player = Player.objects.get(user=request.user)
        
        # Update player fields
        if 'first_name' in request.data:
            player.first_name = request.data['first_name']
        if 'last_name' in request.data:
            player.last_name = request.data['last_name']
        if 'phone' in request.data:
            player.phone_number = request.data['phone']
        if 'rating' in request.data:
            player.skill_rating = request.data['rating']
        if 'availability' in request.data:
            player.availability = request.data['availability']
        if 'preferredPlay' in request.data:
            player.preferred_play = request.data['preferredPlay']
        if 'notifications' in request.data:
            player.notifications_enabled = request.data['notifications']
        if 'emailNotifications' in request.data:
            player.email_notifications = request.data['emailNotifications']
        if 'pushNotifications' in request.data:
            player.push_notifications = request.data['pushNotifications']
        
        # Save the updated player
        player.save()
        
        # Also update the user fields if provided
        if 'first_name' in request.data:
            request.user.first_name = request.data['first_name']
        if 'last_name' in request.data:
            request.user.last_name = request.data['last_name']
        if 'email' in request.data:
            request.user.email = request.data['email']
        
        # Save the updated user
        request.user.save()
        
        return Response({
            'first_name': player.first_name,
            'last_name': player.last_name,
            'email': player.email,
            'phone': player.phone_number,
            'rating': float(player.skill_rating),
            'location': player.get_location_display(),
            'availability': player.availability,
            'preferredPlay': player.preferred_play,
            'notifications': player.notifications_enabled,
            'emailNotifications': player.email_notifications,
            'pushNotifications': player.push_notifications,
        }, status=status.HTTP_200_OK)
    except Player.DoesNotExist:
        return Response({
            'error': 'Player profile not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
