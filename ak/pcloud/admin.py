from django.contrib import admin
from .models import Game, Genre


@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    search_fields = ('name',)


@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    filter_horizontal = ('genres',)
    search_fields = ('title', 'developer')
    list_display = ('title', 'developer', 'release_date', 'age_rating')
