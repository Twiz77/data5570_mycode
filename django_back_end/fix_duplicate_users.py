import os
import django
import sys

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_back_end.settings')
django.setup()

from django.contrib.auth.models import User
from collections import defaultdict

# Find duplicate usernames
username_count = defaultdict(list)
for user in User.objects.all():
    username_count[user.username].append(user)

# Print duplicate usernames
print("Duplicate usernames found:")
for username, users in username_count.items():
    if len(users) > 1:
        print(f"\nUsername: {username}")
        for i, user in enumerate(users):
            print(f"  {i+1}. ID: {user.id}, Email: {user.email}, Date joined: {user.date_joined}")

# Delete one of each duplicate (keeping the oldest)
print("\nDeleting duplicate users (keeping the oldest):")
for username, users in username_count.items():
    if len(users) > 1:
        # Sort by date_joined (oldest first)
        users.sort(key=lambda u: u.date_joined)
        # Keep the oldest, delete the rest
        for user in users[1:]:
            print(f"Deleting user: {user.username} (ID: {user.id})")
            user.delete()

print("\nDone! All usernames should now be unique.") 