from django.db import models
from django.contrib.auth.models import User  # Import Django's built-in User model

class Location(models.Model):
    location_id = models.AutoField(primary_key=True)
    courts = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=2)

    def __str__(self):
        return f"{self.courts} - {self.city}, {self.state}"

class Player(models.Model):
    PREFERRED_PLAY_CHOICES = [
        ('Singles', 'Singles'),
        ('Doubles', 'Doubles'),
        ('Both', 'Both'),
    ]

    # Link to Django User
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    
    # Personal Information
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15)
    
    # Pickleball Information
    skill_rating = models.DecimalField(max_digits=3, decimal_places=1, default=3.0)
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, blank=True)
    experience_years = models.DecimalField(max_digits=4, decimal_places=1, default=0.0, 
                                          help_text="Years of pickleball experience")
    
    # Availability and Preferences
    availability = models.JSONField(default=list)  # Stores list of availability options
    preferred_play = models.CharField(
        max_length=10,
        choices=PREFERRED_PLAY_CHOICES,
        default='Both'
    )
    
    # Notification Settings
    notifications_enabled = models.BooleanField(default=True)
    email_notifications = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.skill_rating})"

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"

    def get_location_display(self):
        """Returns location in the format expected by the frontend (e.g., 'Seattle, WA')"""
        if self.location:
            return f"{self.location.city}, {self.location.state}"
        return ""

    class Meta:
        ordering = ['-created_at']
