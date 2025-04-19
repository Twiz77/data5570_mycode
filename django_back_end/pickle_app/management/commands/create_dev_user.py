from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from pickle_app.models import Player
from rest_framework.authtoken.models import Token

class Command(BaseCommand):
    help = 'Creates a development user for testing'

    def handle(self, *args, **kwargs):
        # Create or get the dev user
        user, created = User.objects.get_or_create(
            username='dev@example.com',
            email='dev@example.com',
            defaults={
                'first_name': 'Dev',
                'last_name': 'User',
                'is_staff': True,  # Make them an admin
                'is_superuser': True  # Give them all permissions
            }
        )

        if created:
            user.set_password('devpassword')
            user.save()
            self.stdout.write(self.style.SUCCESS('Created new dev user'))
        else:
            self.stdout.write(self.style.SUCCESS('Dev user already exists'))

        # Create or get the player profile
        player, created = Player.objects.get_or_create(
            user=user,
            defaults={
                'first_name': 'Dev',
                'last_name': 'User',
                'email': 'dev@example.com',
                'phone_number': '123-456-7890',
                'skill_rating': 3.5,
                'availability': ['Weekdays', 'Weekends', 'Evenings', 'Flexible'],
                'preferred_play': 'Both',
                'notifications_enabled': True,
                'email_notifications': True,
                'push_notifications': True
            }
        )

        if created:
            self.stdout.write(self.style.SUCCESS('Created new player profile'))
        else:
            self.stdout.write(self.style.SUCCESS('Player profile already exists'))

        # Create or get the auth token
        token, created = Token.objects.get_or_create(user=user)
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created new auth token: {token.key}'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Using existing auth token: {token.key}')) 