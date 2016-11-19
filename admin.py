from django import forms
from django.contrib import admin

from .models import *

@admin.register(Subtitles)
class SubtitlesAdmin(admin.ModelAdmin):
    list_display = ('video', 'version_name')

class VideoAdminForm(forms.ModelForm):
    class Meta:
        model = Video
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super(VideoAdminForm, self).__init__(*args, **kwargs)
        if self.instance:
            self.fields['default_subtitles'].queryset = Subtitles.objects.filter(video=self.instance)

@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    form = VideoAdminForm
