from django.shortcuts import render
from django.http import HttpResponse, Http404, JsonResponse

import json

from .models import *

def get_subtitles_from_video(video_id, version_name = None):
    """ Return a subtitles version attached to this video_id.
    Order of preference is: same version_name, default
    subtitles, first subtitles from DB.
    Return None if no subtitles found.
    """
    subs = Subtitles.objects.filter(video__video_id=video_id)
    # First check if there are subs for this video.
    if subs.count() == 0:
        return None
    # Then check if we have a version with the given
    # version name.
    if version_name:
        version_subs = Subtitles.objects.filter(
                video__video_id=video_id,
                version_name=version_name)
        if version_subs.count() == 1:
            return version_subs.get()
    # Then check if we have a default version
    video = Video.objects.filter(video_id=video_id)
    if video.count() == 1:
        default_subs = video.get().default_subtitles
        if default_subs:
            return default_subs
    # Then take one of the available subtitles
    return subs[0]
        
def get_subtitles_versions(video_id):
    return Subtitles.objects.values_list('version_name', 
            flat=True).filter(video__video_id=video_id)

def subtitles_editor(request, video_id):
    version_name = request.GET.get('version', None)
    subs = get_subtitles_from_video(video_id, version_name)
    if subs:
        subtitles = {
                    'subtitles': json.loads(subs.subtitles_json)\
                            .get("subtitles"),
                    'is_default_version': subs.is_default_version,
                    'version': subs.version_name
                    }
    context = {
            'video_id': video_id, 
            'subtitles': subtitles,
            'all_versions': get_subtitles_versions(video_id)
            }
    print(context)
    return render(request, 'ytts/subtitles_editor.html', context)

def subtitles_viewer(request, video_id):
    context = {'video_id': video_id, 
            'subtitles': get_subtitles_from_video(video_id)}
    return render(request, 'ytts/subtitles_viewer.html', context)

def subtitles_saver(request, video_id):
    if request.method != "POST":
        raise Http404("Only POST method allowed here.")
    try:
        subs_json = json.loads(request.POST['subtitles_json'])
    except ValueError:
        return JsonResponse({
            'status':"BAD_FORMAT", 
            'comment':"Incorrectly formatted JSON"})
    except KeyError:
        return JsonResponse({
            'status':"MISSING_PARAMETER", 
            'comment':"Missing subtitles_json parameter"})
    try:
        version_name = request.POST['version_name']
    except KeyError:
        return JsonResponse({
            'status':"BAD_FORMAT",
            'comment':"missing version name"})
    if is_valid_subtitles(subs_json):
        return JsonResponse(
                save_subtitles(subs_json, video_id, version_name)
                )
    else:
        return JsonResponse({'status':"INVALID_SUBTITLES", 'comment':""})

def save_subtitles(subtitles, video_id, version_name):
    subs = Subtitles.objects.filter(
            video__video_id=video_id, 
            version_name=version_name)
    sub_len = subs.count()
    if sub_len == 0:
        # check if default version already exists
        is_default = (Subtitles.objects.filter(
                video_id=video_id,
                is_default_version=True).count() == 0)
        subs = Subtitles(
                video_id=video_id, 
                subtitles_json=json.dumps({
                    "is_valid_checked": True, 
                    "subtitles": subs_json
                    }),
                version_name=version_name,
                is_default=default
                )
        subs.save()
        return {'status':"OK", 'comment':"NEW"}
    elif sub_len > 0:
        subs = subs.get()
        subs.subtitles_json = json.dumps({
            "is_valid_checked": True,
            "subtitles": subtitles
            })
        subs.save()
        return {'status':"OK", 'comment':"OVERRIDEN"}


def subtitles_loader(request, video_id):
    version_name = request.GET.get('version', None)
    return JsonResponse(
            get_subtitles_from_video(
                video_id, 
                version_name=version_name), 
            safe=False)

def is_valid_subtitles(subtitles):
    return True
