from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Customer

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'email', 'phone_number', 'created_at')  # Customize what you see in the admin panel
    search_fields = ('first_name', 'last_name', 'email')  # Enable search
    list_filter = ('created_at',)  # Add filtering

# Alternatively, you can use:
# admin.site.register(Customer)
