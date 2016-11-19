from django.conf.urls import url

from . import views

app_name = 'ytts'
urlpatterns = [
    url(r'^(?P<video_id>[a-zA-Z0-9_=&]+)/edit/$', 
        views.subtitles_editor, 
        name='subtitles_editor'),
    url(r'^(?P<video_id>[a-zA-Z0-9_=&]+)/$', 
        views.subtitles_viewer, 
        name='subtitles_viewer'),
    url(r'^(?P<video_id>[a-zA-Z0-9_=&]+)/load/$', 
        views.subtitles_loader, 
        name='subtitles_loader'),
    url(r'^(?P<video_id>[a-zA-Z0-9_=&]+)/save/$', 
        views.subtitles_saver, 
        name='subtitles_saver'),
]
