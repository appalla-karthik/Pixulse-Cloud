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

class Guild(models.Model):
    name = models.CharField(max_length=100)
    tag = models.CharField(max_length=10)
    game = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    member_count = models.IntegerField(default=1)
    
    def __str__(self):
        return f"[{self.tag}] {self.name}"

class GuildApplication(models.Model):
    guild = models.ForeignKey(Guild, on_delete=models.CASCADE, related_name='applications')
    username = models.CharField(max_length=100) # Simple username for mock purposes
    message = models.TextField()
    share_stats = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.username} -> {self.guild.name}"

class RecruitmentPost(models.Model):
    guild = models.ForeignKey(Guild, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField()
    author = models.CharField(max_length=100) # Simple string author
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title
