from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from pickle_app.models import Player
from rest_framework.authtoken.models import Token

class Command(BaseCommand):
    help = 'Verifies the development user exists and has correct credentials'

    def handle(self, *args, **options):
        try:
            # Check if dev user exists
            user = User.objects.get(email='dev@example.com')
            self.stdout.write(self.style.SUCCESS(f'Dev user found with ID: {user.id}'))
            
            # Check if user is staff/superuser
            self.stdout.write(f'Is staff: {user.is_staff}')
            self.stdout.write(f'Is superuser: {user.is_superuser}')
            
            # Check if player profile exists
            try:
                player = Player.objects.get(user=user)
                self.stdout.write(self.style.SUCCESS(f'Player profile found with ID: {player.id}'))
            except Player.DoesNotExist:
                self.stdout.write(self.style.ERROR('Player profile not found for dev user'))
            
            # Check if token exists
            try:
                token = Token.objects.get(user=user)
                self.stdout.write(self.style.SUCCESS(f'Token exists: {token.key}'))
            except Token.DoesNotExist:
                self.stdout.write(self.style.ERROR('Token not found for dev user'))
                
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR('Dev user not found in database')) 