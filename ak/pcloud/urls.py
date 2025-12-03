from django.urls import path
from .views import home, game_detail

urlpatterns = [
    path('', home, name='home'),
    path('game/<int:game_id>/', game_detail, name='game_detail'), 
]
