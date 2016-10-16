from django.shortcuts import render
from django.http import HttpResponse, Http404, JsonResponse

import json

from .models import Subtitles

def get_subtitles_from_video(video_id):
    sub_len = Subtitles.objects.filter(video_id=video_id).count()
    print(sub_len)
    if sub_len == 0:
        subs = None
    elif sub_len == 1:
        subs = Subtitles.objects.filter(video_id=video_id).get()
    elif sub_len > 1:
        # TODO: actual logic for multiple existing subtitles
        subs = Subtitles.objects.filter(video_id=video_id)[0]
    if subs:
        subs = json.loads(subs.subtitles_json)
        if subs.get("is_valid_checked", False):
            return subs.get("subtitles", None)
    return None

def subtitles_editor(request, video_id):
    context = {'video_id': video_id, 
            'subtitles': get_subtitles_from_video(video_id)}
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
