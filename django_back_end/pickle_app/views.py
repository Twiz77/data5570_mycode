from django.shortcuts import render
from rest_framework import generics, viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import User, Player, Location
from .serializers import UserSerializer, PlayerSerializer, LocationSerializer
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

@api_view(['POST'])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        # Create a player profile for the user
        player = Player.objects.create(
            user=user,
            first_name=request.data.get('first_name', ''),
            last_name=request.data.get('last_name', ''),
            phone_number=request.data.get('phone_number', '')
        )
        return Response({
            'id': user.id,
            'email': user.email,
            'player_id': player.id
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
        # Get all players with their related data
        players = Player.objects.select_related('user', 'location').all()
        
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
