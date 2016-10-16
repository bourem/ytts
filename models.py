from django.db import models

class Subtitles(models.Model):
    video_id = models.CharField(max_length=20)
    subtitles_json = models.TextField()
