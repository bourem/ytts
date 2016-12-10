from django.shortcuts import render
from django.http import HttpResponse, Http404, JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie

import json

from .models import *

def get_subtitles_from_video(
        video_id, 
        version_name=None, 
        version_strict=False):
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
    if version_name is not None:
        version_subs = Subtitles.objects.filter(
                video__video_id=video_id,
                version_name=version_name)
        if version_subs.count() == 1:
            return version_subs.get()
    if version_strict:
        return None
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

@ensure_csrf_cookie
def subtitles_editor(request, video_id):
    version_name = request.GET.get('version', None)
    subs = get_subtitles_from_video(video_id, version_name)
    subtitles = {}
    if subs is not None:
        subtitles = {
                    'subtitles': json.loads(subs.subtitles_json)\
                            .get("subtitles"),
                    'is_default_version': subs.is_default_version,
                    'version': subs.version_name
                    }
    else:
        if version_name is None:
            version_name = "default"
        save_subtitles([], video_id, version_name)
        subtitles = {
                    'subtitles': [],
                    'is_default_version': True,
                    'version': version_name
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
            'subtitles': json.loads(get_subtitles_from_video(video_id)\
                    .subtitles_json).get("subtitles")}
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
    """ Save subtitles on given video and with given version_name """
    # Grab video. If Video does not exist then create.
    video = Video.objects.filter(video_id = video_id)
    if video.count() == 0:
        video = Video(video_id=video_id, default_subtitles=None)
        video.save()
    else:
        video = video.get()

    subs = Subtitles.objects.filter(
            video=video, 
            version_name=version_name)
    sub_len = subs.count()

    # Save subtitles. If Subtitle exists then override, else create.
    if sub_len > 0:
        subs = subs.get()
        subs.subtitles_json = json.dumps({
            "is_valid_checked": True,
            "subtitles": subtitles
            })
        subs.save()
        return {'status':"OK", 'comment':"OVERRIDEN"}
    elif sub_len == 0:
        subs = Subtitles(
                video=video, 
                subtitles_json=json.dumps({
                    "is_valid_checked": True, 
                    "subtitles": subtitles
                    }),
                version_name=version_name,
                )
        subs.save()
        if video.default_subtitles is None:
            video.default_subtitles = subs
            video.save()
        return {'status':"OK", 'comment':"NEW"}


def subtitles_loader(request, video_id):
    version_name = request.GET.get('version_name', None)
    subs = get_subtitles_from_video(
            video_id,
            version_name=version_name,
            version_strict=True)
    if not subs:
        return JsonResponse(None, safe=False)
    else:
        return JsonResponse(
                json.loads(subs.subtitles_json).get("subtitles"),
                safe=False)

def is_valid_subtitles(subtitles):
    return True
