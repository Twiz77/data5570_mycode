from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'players', views.PlayerViewSet, basename='player')
router.register(r'locations', views.LocationViewSet, basename='location')
router.register(r'connections', views.ConnectionViewSet, basename='connection')
router.register(r'friend-requests', views.FriendRequestViewSet, basename='friend-request')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', views.register_user, name='register'),
    path('auth/login/', views.login_user, name='login'),
    path('auth/profile/', views.get_user_profile, name='profile'),
    path('auth/profile/update/', views.update_user_profile, name='update-profile'),
    path('users/all/', views.get_all_users, name='all-users'),
]
