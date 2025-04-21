import os
import django
import sys

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_back_end.settings')
django.setup()

from django.contrib.auth.models import User
from collections import defaultdict

# Find duplicate emails
email_count = defaultdict(list)
for user in User.objects.all():
    if user.email:  # Only process users with email addresses
        email_count[user.email.lower()].append(user)  # Convert to lowercase for comparison

# Print duplicate emails
print("Duplicate emails found:")
duplicate_found = False
for email, users in email_count.items():
    if len(users) > 1:
        duplicate_found = True
        print(f"\nEmail: {email}")
        for i, user in enumerate(users):
            print(f"  {i+1}. ID: {user.id}, Username: {user.username}, Date joined: {user.date_joined}")

# Delete users with duplicate emails (keeping the oldest)
print("\nDeleting users with duplicate emails (keeping the oldest account):")
for email, users in email_count.items():
    if len(users) > 1:
        # Sort by date_joined (oldest first)
        users.sort(key=lambda u: u.date_joined)
        # Keep the oldest, delete the rest
        for user in users[1:]:
            print(f"Deleting user: {user.username} (ID: {user.id}, Email: {user.email})")
            user.delete()

if not duplicate_found:
    print("No duplicate emails found.")

print("\nDone! All emails should now be unique.") 