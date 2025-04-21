import os
import django
import sys

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_back_end.settings')
django.setup()

from django.contrib.auth.models import User

# List of test-related usernames to delete
test_usernames = [
    'testuser',
    'testing',
    'Tester1',
    'Tester2'
]

print("\nDeleting test users:")
for username in test_usernames:
    try:
        user = User.objects.get(username=username)
        print(f"Deleting user: {username} (ID: {user.id}, Email: {user.email})")
        user.delete()
    except User.DoesNotExist:
        print(f"User {username} not found")

print("\nDone! Test users have been deleted while preserving the dev user.") 