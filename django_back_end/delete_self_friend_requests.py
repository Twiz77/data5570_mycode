import os
import django
import sys

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_back_end.settings')
django.setup()

from pickle_app.models import FriendRequest

print("\nChecking all friend requests:")
deleted_count = 0

# Get all friend requests
friend_requests = FriendRequest.objects.all()

print(f"\nTotal friend requests found: {friend_requests.count()}")

for request in friend_requests:
    print(f"\nChecking request ID {request.id}:")
    print(f"Sender ID: {request.sender.id}, Username: {request.sender.user.username}")
    print(f"Receiver ID: {request.receiver.id}, Username: {request.receiver.user.username}")
    
    # Compare the user IDs directly
    if request.sender.user.id == request.receiver.user.id:
        print(f"Found self-friend request! Deleting request ID {request.id}")
        request.delete()
        deleted_count += 1
    else:
        print("Not a self-friend request")

print(f"\nDone! Deleted {deleted_count} self-friend requests.") 