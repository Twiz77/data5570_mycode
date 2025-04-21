import os
import django
import sys

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_back_end.settings')
django.setup()

from django.contrib.auth.models import User

print("\nAll users in the database:")
print("-" * 50)
for user in User.objects.all():
    print(f"ID: {user.id}")
    print(f"Username: {user.username}")
    print(f"Email: {user.email}")
    print(f"Date joined: {user.date_joined}")
    print("-" * 50) 