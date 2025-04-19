from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from pickle_app.models import Player, Location
from rest_framework.authtoken.models import Token

class Command(BaseCommand):
    help = 'Fixes the development user by creating missing player profile and token'

    def handle(self, *args, **options):
        try:
            # Get the dev user
            user = User.objects.get(email='dev@example.com')
            self.stdout.write(self.style.SUCCESS(f'Found dev user with ID: {user.id}'))
            
            # Create player profile if it doesn't exist
            try:
                player = Player.objects.get(user=user)
                self.stdout.write(self.style.SUCCESS(f'Player profile already exists with ID: {player.id}'))
            except Player.DoesNotExist:
                # Create a default location if none exists
                location, _ = Location.objects.get_or_create(
                    city='San Francisco',
                    state='CA',
                    defaults={'courts': 'Golden Gate Park'}
                )
                
                # Create the player profile
                player = Player.objects.create(
                    user=user,
                    first_name='Dev',
                    last_name='User',
                    email=user.email,
                    phone_number='123-456-7890',
                    skill_rating=4.0,
                    location=location,
                    availability=['Monday', 'Wednesday', 'Friday'],
                    preferred_play='Both',
                    notifications_enabled=True,
                    email_notifications=True,
                    push_notifications=True
                )
                self.stdout.write(self.style.SUCCESS(f'Created player profile with ID: {player.id}'))
            
            # Create token if it doesn't exist
            try:
                token = Token.objects.get(user=user)
                self.stdout.write(self.style.SUCCESS(f'Token already exists: {token.key}'))
            except Token.DoesNotExist:
                token = Token.objects.create(user=user)
                self.stdout.write(self.style.SUCCESS(f'Created new token: {token.key}'))
                
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR('Dev user not found in database')) 