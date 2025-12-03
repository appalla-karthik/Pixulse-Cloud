from django.shortcuts import render, get_object_or_404
from .models import Game

def home(request):
    games = Game.objects.all() 
    return render(request, 'home.html', {'games': games})

def game_detail(request, game_id):
    game = get_object_or_404(Game, id=game_id)  # Fetch game by ID
    return render(request, 'gamepage.html', {'game': game})
