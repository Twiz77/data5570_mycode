from django.contrib.auth.models import User
from pickle_app.models import Player, Connection, FriendRequest
from django.db import models

def setup_mock_connections():
    """
    Set up mock connections and friend requests for the dev user.
    Creates 2 connections and 2 pending friend requests.
    """
    print("Setting up mock connections and friend requests...")
    
    # Get the dev user and player
    try:
        dev_user = User.objects.get(email='dev@example.com')
        dev_player = Player.objects.get(user=dev_user)
        print(f"Found dev user: {dev_player.first_name} {dev_player.last_name}")
    except (User.DoesNotExist, Player.DoesNotExist):
        print("Dev user not found. Please make sure the dev user exists.")
        return
    
    # Get all other players
    other_players = Player.objects.exclude(id=dev_player.id)
    if other_players.count() < 4:
        print("Not enough players in the database. Need at least 4 other players.")
        return
    
    # Create 2 connections
    connection_players = list(other_players)[:2]
    for player in connection_players:
        # Check if connection already exists
        if not Connection.objects.filter(
            (models.Q(player1=dev_player, player2=player) | 
             models.Q(player1=player, player2=dev_player))
        ).exists():
            Connection.objects.create(
                player1=dev_player,
                player2=player
            )
            print(f"Created connection with {player.first_name} {player.last_name}")
    
    # Create 2 pending friend requests
    request_players = list(other_players)[2:4]
    for player in request_players:
        # Check if friend request already exists
        if not FriendRequest.objects.filter(
            sender=player,
            receiver=dev_player,
            status='pending'
        ).exists():
            FriendRequest.objects.create(
                sender=player,
                receiver=dev_player,
                status='pending'
            )
            print(f"Created friend request from {player.first_name} {player.last_name}")
    
    print("Mock connections and friend requests setup complete!")

if __name__ == "__main__":
    setup_mock_connections() 