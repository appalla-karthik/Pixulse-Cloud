from django.urls import path
from .views import (
    home, game_detail, userverse, guildnexus, 
    arena_trends, arena_industry, arena_workshops, esports,
    api_create_guild, api_apply_guild, api_create_post
)

urlpatterns = [
    path('', home, name='home'),
    path('game/<int:game_id>/', game_detail, name='game_detail'), 
    path('userverse/', userverse, name='userverse'),
    path('guildnexus/', guildnexus, name='guildnexus'),
    path('arena/trends/', arena_trends, name='arena_trends'),
    path('arena/industry/', arena_industry, name='arena_industry'),
    path('arena/workshops/', arena_workshops, name='arena_workshops'),
    path('esports/', esports, name='esports'),
    
    # Guildnexus APIs
    path('api/guild/create/', api_create_guild, name='api_create_guild'),
    path('api/guild/apply/', api_apply_guild, name='api_apply_guild'),
    path('api/guild/post/', api_create_post, name='api_create_post'),
]
