import os
import django
import sys

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_back_end.settings')
django.setup()

from pickle_app.models import FriendRequest, Player
from django.contrib.auth.models import User

def check_user_friend_requests(username):
    try:
        user = User.objects.get(username=username)
        player = Player.objects.get(user=user)
        
        print(f"\nChecking friend requests for user: {username}")
        print(f"User ID: {user.id}")
        print(f"Player ID: {player.id}")
        
        # Check sent requests
        sent_requests = FriendRequest.objects.filter(sender=player)
        print(f"\nSent requests ({sent_requests.count()}):")
        for request in sent_requests:
            print(f"Request ID: {request.id}")
            print(f"To: {request.receiver.user.username} (ID: {request.receiver.user.id})")
            print(f"Status: {request.status}")
            print("---")
        
        # Check received requests
        received_requests = FriendRequest.objects.filter(receiver=player)
        print(f"\nReceived requests ({received_requests.count()}):")
        for request in received_requests:
            print(f"Request ID: {request.id}")
            print(f"From: {request.sender.user.username} (ID: {request.sender.user.id})")
            print(f"Status: {request.status}")
            print("---")
            
    except User.DoesNotExist:
        print(f"User {username} not found")
    except Player.DoesNotExist:
        print(f"Player profile not found for user {username}")

# Check friend requests for greyson@example.com
check_user_friend_requests('greyson@example.com') 