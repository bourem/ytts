from django.db import models

class Subtitles(models.Model):
    video = models.ForeignKey(
            "Video",
            on_delete=models.PROTECT)
    
    subtitles_json = models.TextField()
    is_default_version = models.BooleanField(default=False)
    version_name = models.CharField(max_length=20)

    class Meta:
        unique_together = (("video", "version_name"))

    def __str__(self):
        return "%s - %s"%(self.video.video_id, self.version_name)

class Video(models.Model):
    video_id = models.CharField(max_length=20, unique=True)
    default_subtitles = models.ForeignKey(
            "Subtitles", 
            on_delete=models.SET_NULL,
            null=True,
            default=None,
            blank=True,
            related_name='+')

    def __str__(self):
        return "%s"%(self.video_id)
