from django.db import models

# Create your models here.
class Game(models.Model):
    title = models.CharField(max_length=255)
    image = models.ImageField(upload_to='game_images/', blank=True, null=True)  
    logo = models.ImageField(upload_to="game_images/")
    background = models.ImageField(upload_to="game_images/")
    about = models.TextField()
    developer = models.CharField(max_length=255)
    release_date = models.DateField()
    age_rating = models.CharField(max_length=50)
    official_website = models.URLField()
    genres = models.ManyToManyField("Genre")

class Genre(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name
