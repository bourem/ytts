from django.db import models

class Subtitles(models.Model):
    video_id = models.CharField(max_length=20)
    subtitles_json = models.TextField()
    is_default_version = models.BooleanField(default=False)
    version_name = models.CharField(max_length=20, blank=True)

    class Meta:
        unique_together = (("video_id", "version_name"), ("video_id",  "is_default_version"))
