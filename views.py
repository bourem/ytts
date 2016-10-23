from django.shortcuts import render
from django.http import HttpResponse, Http404, JsonResponse

import json

from .models import Subtitles

def get_subtitles_from_video(video_id, version_name = None):
    """ Return one subtitles version.
    The desc order of preference for the chosen subtitles version is: 
    version_name, is_default_version, first subtitle in the list.
    """
    subs = Subtitles.objects.filter(video_id=video_id)
    sub_len = subs.count()
    if sub_len == 0:
        return None
    elif sub_len == 1:
        subs = subs.get()
        if not subs.is_default_version:
            subs.is_default_version = True
            subs.save()
    elif sub_len > 1:
        if version_name:
            version_subs = Subtitles.objects.filter(
                    video_id=video_id,
                    version_name=version_name)
            if version_subs.count() >= 1:
                subs = version_subs[0]
            else:
                default_subs = Subtitles.objects.filter(
                        video_id=video_id,
                        is_default_version=True)
                if default_subs.count() >= 1:
                    subs = default_subs[0]
                else:
                    subs = subs[0]
    subs = json.loads(subs.subtitles_json)
    if subs.get("is_valid_checked", False):
        return subs.get("subtitles", None)
    else:
        return None

def get_subtitles_versions(video_id):
    return Subtitles.objects.values_list('version_name', 
            flat=True).filter(video_id=video_id)

def subtitles_editor(request, video_id):
    context = {'video_id': video_id, 
            'subtitles': get_subtitles_from_video(video_id),
            'versions': get_subtitles_versions(video_id)}
    print(context)
    return render(request, 'ytts/subtitles_editor.html', context)

def subtitles_viewer(request, video_id):
    context = {'video_id': video_id, 
            'subtitles': get_subtitles_from_video(video_id)}
    return render(request, 'ytts/subtitles_viewer.html', context)

def subtitles_save(request, video_id):
    if request.method == "POST":
        try:
            subs_json = json.loads(request.POST['subtitles_json'])
        except:
            return HttpResponse("some errors during process")
        if is_valid_subtitles(subs_json):
            sub_len = Subtitles.objects.filter(video_id=video_id).count()
            if sub_len == 0:
                subs = Subtitles(
                        video_id=video_id, 
                        subtitles_json=json.dumps({
                            "is_valid_checked": True, 
                            "subtitles": subs_json
                            })
                        )
                subs.save()
                return HttpResponse("saved! (new)")
            elif sub_len > 0:
                subs = Subtitles.objects.filter(video_id=video_id)[0]
                subs.subtitles_json = json.dumps({
                    "is_valid_checked": True,
                    "subtitles": subs_json
                    })
                subs.save()
                return HttpResponse("saved! (override)")
        else:
            return HttpResponse("invalid subtitles json")
    raise Http404("wrong verb")

def subtitles_load(request, video_id):
    return JsonResponse(get_subtitles_from_video(video_id), safe=False)

def is_valid_subtitles(subtitles):
    return True
