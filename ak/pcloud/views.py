from django.shortcuts import render, get_object_or_404
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Game, Guild, GuildApplication, RecruitmentPost

def home(request):
    games = Game.objects.all() 
    return render(request, 'home.html', {'games': games})

def game_detail(request, game_id):
    game = get_object_or_404(Game, id=game_id)  # Fetch game by ID
    return render(request, 'gamepage.html', {
        'game': game,
        'webrtc_public_url': settings.WEBRTC_PUBLIC_URL.rstrip('/'),
    })

def userverse(request):
    mock_stats = {
        'username': 'CYBER_NINJA_99',
        'level': 42,
        'rank': 'Diamond II',
        'hours_played': 1337,
        'win_rate': '68.5%',
        'kd_ratio': '1.84',
        'achievements': 245,
        'recent_games': [
            {'title': 'Cyberpunk 2077', 'progress': 85, 'hours': 120, 'cover': 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2mvt.jpg'},
            {'title': 'Valorant', 'progress': 45, 'hours': 500, 'cover': 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2mxg.jpg'},
            {'title': 'Elden Ring', 'progress': 100, 'hours': 200, 'cover': 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.jpg'},
            {'title': 'Apex Legends', 'progress': 60, 'hours': 350, 'cover': 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wtt.jpg'}
        ],
        'friends': [
            {'name': 'Hacker_Boy', 'status': 'Playing Valorant', 'avatar': 'https://ui-avatars.com/api/?name=HB&background=111&color=fff', 'state': 'online'},
            {'name': 'Pixel_Master', 'status': 'In Lobby - Waiting', 'avatar': 'https://ui-avatars.com/api/?name=PM&background=333&color=fff', 'state': 'away'},
            {'name': 'Neon_Samurai', 'status': 'Offline', 'avatar': 'https://ui-avatars.com/api/?name=NS&background=222&color=888', 'state': 'offline'},
            {'name': 'GamerGirl007', 'status': 'Playing Cyberpunk 2077', 'avatar': 'https://ui-avatars.com/api/?name=GG&background=ff007f&color=fff', 'state': 'online'}
        ]
    }
    return render(request, 'userverse.html', {'stats': mock_stats})

def guildnexus(request):
    guilds = Guild.objects.all()
    posts = RecruitmentPost.objects.all().order_by('-created_at')
    
    # If no guilds exist, create some mock ones to populate the page initially
    if not guilds.exists():
        Guild.objects.create(name='NEON DRAGONS', tag='ND', game='Valorant', description='Competitive Valorant squad.', member_count=45)
        Guild.objects.create(name='PIXEL KNIGHTS', tag='PK', game='World of Warcraft', description='Casual raiding and dungeons.', member_count=120)
        Guild.objects.create(name='VOID RUNNERS', tag='VR', game='Apex Legends', description='Fast-paced movement players.', member_count=14)
        guilds = Guild.objects.all()
        
    return render(request, 'guildnexus.html', {
        'guilds': guilds,
        'posts': posts
    })

@csrf_exempt
def api_create_guild(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        guild = Guild.objects.create(
            name=data.get('name'),
            tag=data.get('tag'),
            game=data.get('game'),
            description=data.get('description'),
            member_count=1
        )
        return JsonResponse({'status': 'success', 'guild_name': guild.name})
    return JsonResponse({'status': 'error'}, status=400)

@csrf_exempt
def api_apply_guild(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        guild = get_object_or_404(Guild, id=data.get('guild_id'))
        app = GuildApplication.objects.create(
            guild=guild,
            username=data.get('username', 'Anonymous'),
            message=data.get('message'),
            share_stats=data.get('share_stats', True)
        )
        return JsonResponse({'status': 'success', 'message': 'Application sent!'})
    return JsonResponse({'status': 'error'}, status=400)

@csrf_exempt
def api_create_post(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        guild_id = data.get('guild_id')
        if not guild_id:
            # Just grab the first guild as mock authentication for now if missing
            guild_id = Guild.objects.first().id
        guild = get_object_or_404(Guild, id=guild_id)
        
        post = RecruitmentPost.objects.create(
            guild=guild,
            title=data.get('title'),
            description=data.get('description'),
            author=data.get('author', 'Anonymous')
        )
        return JsonResponse({'status': 'success', 'post_title': post.title})
    return JsonResponse({'status': 'error'}, status=400)

def arena_trends(request):
    return render(request, 'arena_trends.html')

def arena_industry(request):
    mock_articles = [
        {'title': 'Cloud Gaming Latency drops by 20% in Q3', 'author': 'System Admin', 'date': '2026-06-01', 'id': 1, 'thumbnail': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&q=80', 'avatar': 'https://ui-avatars.com/api/?name=SA&background=111&color=0ff', 'read_time': '5 min'},
        {'title': 'Unreal Engine 6 Integration Tips', 'author': 'DevGuru', 'date': '2026-05-28', 'id': 2, 'thumbnail': 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80', 'avatar': 'https://ui-avatars.com/api/?name=DG&background=222&color=f0f', 'read_time': '12 min'},
        {'title': 'Rise of Retro-Cyber Aesthetics in 2026', 'author': 'Art Director', 'date': '2026-05-15', 'id': 3, 'thumbnail': 'https://images.unsplash.com/photo-1614729939124-03290b05afb5?w=600&q=80', 'avatar': 'https://ui-avatars.com/api/?name=AD&background=333&color=0f0', 'read_time': '8 min'}
    ]
    return render(request, 'arena_industry.html', {'articles': mock_articles})

def arena_workshops(request):
    mock_videos = [
        {'title': 'Advanced Movement Mechanics in Apex', 'views': '24.5K', 'duration': '15:20', 'thumbnail': 'https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc6u24.jpg'},
        {'title': 'Cyberpunk 2077 Optimal Settings', 'views': '12.1K', 'duration': '08:45', 'thumbnail': 'https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc8f5e.jpg'},
        {'title': 'Elden Ring Boss Guide: Malenia', 'views': '89.3K', 'duration': '22:10', 'thumbnail': 'https://images.igdb.com/igdb/image/upload/t_screenshot_big/scbeih.jpg'},
        {'title': 'Valorant Crosshair Placement Tips', 'views': '45.2K', 'duration': '11:05', 'thumbnail': 'https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc8m1u.jpg'}
    ]
    return render(request, 'arena_workshops.html', {'videos': mock_videos})

def esports(request):
    mock_matches = [
        {'team1': 'SENTINELS', 'team2': 'CLOUD9', 'game': 'Valorant', 'status': 'LIVE', 'score': '12 - 10'},
        {'team1': 'T1', 'team2': 'GEN.G', 'game': 'League of Legends', 'status': 'UPCOMING', 'score': '-'},
        {'team1': 'NAVI', 'team2': 'VITALITY', 'game': 'CS2', 'status': 'FINISHED', 'score': '2 - 0'}
    ]
    return render(request, 'esports.html', {'matches': mock_matches})

