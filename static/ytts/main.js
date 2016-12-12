window.ytts = {};

ytts.initEventListeners = function() {
    // Subtitle Controls
    document.getElementById("subtitleControlAdd")
        .addEventListener("click", function(){ytts.addSubtitle()});
    document.getElementById("subtitleControlSave")
        .addEventListener("click", ytts.saveSubtitles); 
    document.getElementById("subtitleControlDownload")
        .addEventListener("click", function(e){ytts.downloadSubtitles(e)});
    document.getElementById("versionControlCreate")
        .addEventListener("click", function() {
            var versionToCreate = document.getElementById("versionToCreate")
                .value;
            var isClone = document.getElementById("versionIsClone").checked;
            var clonedFrom = null;
            if(isClone) {
                var clonedFrom = ytts.currentVersion;
            }
            ytts.createSubtitles(versionToCreate, clonedFrom);
        });

    // Subtitles template - some pb with template node and eventlisteners
//    var template = document.getElementById("subtitleTemplate");
//    template.content.querySelector("[data-subtitleinsert='before']")
//        .addEventListener("dragover", function(e){ytts.dragover_handler(e)});
//        .addEventListener("drop", function(e){ytts.drop_handler(e)})
//        .addEVentListener("dragstart", function(e){ytts.dragstartSubtitle(e)});
};

(function() {
    Vue.prototype.$http = axios;
    
    var csrftoken = getCookie('csrftoken');
    
    var videoId = document.getElementById("ytplayer")
        .getAttribute("data-initvideoid");

    window.vSubtitlesLoader = new Vue({
        el: "#subtitlesLoader",
        data: {
            // Available versions for this video
            availableVersions: initVersions,
            // Selected in select-box
            selectedVersion: initVersion,
            // Actually loaded and displayed. Current version
            loadedVersion: initVersion
        },
        methods: {
            loadVersion: function() {
                var versionName = this.selectedVersion;
                this.$http.get("/ytts/" + videoId + "/load/", {
                    params: {
                        version_name: versionName,
                    },
                    responseType: "json"
                }).then(function (response) {
                    console.log(response);
                    var newSubs = response.data;
                    document.getElementById("current_version_name").innerHTML = versionName;
                    ytts.currentVersion = versionName;
                    this.loadedVersion = versionName
                    ytts.updateSubtitlesView(newSubs);
                });
            }
        }
    });

    window.vSubtitles = new Vue({
        el: "#subtitles",
        data: {
            subtitles: initSubtitles,
            currentVersion: initVersion
        },
        methods: {
            addSubtitle: function(subtitleParams) {
                var newSubtitle = {};
                if (subtitleParams) {
                    newSubtitle = {
                        subtitle: subtitleParams['subtitle'],
                        start: subtitleParams['start'],
                        stop: subtitleParams['stop']
                    };
                }
                this.subtitles.push(newSubtitle);
            },
            setStart: function(index) {
                var startTimestamp = secondsToTime(player.getCurrentTime());
                this.subtitles[index].start = startTimestamp;
            },
            setStop: function(index) {
                var startTimestamp = secondsToTime(player.getCurrentTime());
                this.subtitles[index].stop = startTimestamp;
            }
        }
    });

    ytts.currentVersion = initVersion;

    // Youtube iFrame API loading
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // Youtube video player control object
    var player, videoLength;

    // Automatically called when Youtube iFrame API loaded.
    // Attaching to window for the API to see it.
    window.onYouTubeIframeAPIReady = function() {
        player = new YT.Player('ytplayer', {
            //height: '390',
            //width: '640',
            videoId: videoId,
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    }

    function onPlayerReady(event) {
        videoLength = event.target.getDuration();
    }

    var activeLineTimer, isLineTimerActive = false;
    // Big switch on player state change.
    function onPlayerStateChange(event) {
        switch(event.data){
            case YT.PlayerState.PLAYING:
                // TODO: PLAYING events are called repeatedly when
                // the video is playing. We should analyze how
                // often it is fired. Might be better to call 
                // displayActiveLine for each PLAYING event, 
                // instead of using setInterval.
                if(!isLineTimerActive) {
                    activeLineTimer = setInterval(
                            function(){
                                ytts.displaySubtitlesAt(player.getCurrentTime());
                            }, 
                            200);
                    
                    isLineTimerActive = true;
                }
                break;
            default:
                isLineTimerActive = false;
                clearInterval(activeLineTimer);

        }
    }

    // Subtitle functions below
    ytts.addSubtitle = function(subtitleParams) {
        vSubtitles.addSubtitle(subtitleParams);
    };

    // Helper function to display seconds (output from YT API)
    // to h:m:s (format for subtitles).
    function secondsToTime(s) {
        var h = Math.floor(s/3600);
        if(h<10) { h = "0"+h;}
        var m = Math.floor((s%3600)/60);
        if(m<10) { m = "0"+m;}
        var s = (s%60).toFixed(3);
        if(s<10) { s = "0"+s;}
        return h+":"+m+":"+s.replace(".", ",");
    }
    function timeToSeconds(t) {
        var [h, m, s] = t.split(":");
        return parseInt(h)*3600 + parseInt(m)*60 + parseFloat(s.replace(",", "."));
    }

    // Returns the subtitles in SubRip format.
    ytts.buildSubRip = function() {
        var subsFinalArray = [];
        var subs = document.getElementById("subtitles").querySelectorAll("[data-subtitle='true']");
        var tmpSubRow, tmpSubString;
        for(var i=0; i<subs.length; i++) {
            tmpSubRow = subs[i];
            tmpSubString = i + "\n";
            tmpSubString += tmpSubRow.querySelector("[data-subtitlestart]").value + "-->";
            tmpSubString += tmpSubRow.querySelector("[data-subtitlestop]").value + "\n";
            tmpSubString += tmpSubRow.querySelector("[data-subtitletext]").value + "\n";
            subsFinalArray.push(tmpSubString);
        }
        var subsFinal = subsFinalArray.join("\n");
        return subsFinal;
    };

    // Returns a subtitles object
    ytts.buildSubsJSON = function() {
        var subsFinalArray = [];
        var subs = document.getElementById("subtitles").querySelectorAll("[data-subtitle='true']");
        var tmpSubRow, tmpSubJSON;
        for(var i=0; i<subs.length; i++) {
            tmpSubRow = subs[i];
            tmpSubJSON = {}
            tmpSubJSON['start'] = tmpSubRow.querySelector("[data-subtitlestart]").value;
            tmpSubJSON['stop'] = tmpSubRow.querySelector("[data-subtitlestop]").value;
            tmpSubJSON['subtitle'] = tmpSubRow.querySelector("[data-subtitletext]").value;
            subsFinalArray.push(tmpSubJSON);
        }
        return subsFinalArray;
    }

    ytts.saveSubtitles = function() {
        console.log(ytts.buildSubRip());
        var xhr = new XMLHttpRequest();
        var url = "/ytts/" + videoId + "/save/";
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.setRequestHeader("X-CSRFToken", csrftoken);
        
        xhr.onreadystatechange = function() {
            if(xhr.readyState == 4) {
                document.getElementById("savingFeedback").style.display = "none";
                if(xhr.status == 200) {
                    console.log(xhr.response);
                }
            }
        };
        
        //var subtitlesJson = [{"subtitle":"blahblah", "start":"00:00:00.0", "stop":"00:00:00.0"},{"subtitle":"blehbleh", "start":"00:00:00.0", "stop":"00:00:00.0"}];
        var subtitlesJSON = ytts.buildSubsJSON();
        document.getElementById("savingFeedback").style.display = "block";
        xhr.send('subtitles_json='+JSON.stringify(subtitlesJSON)+'&version_name='+ytts.currentVersion);
    }

    // TODO: change function signature or name.
    ytts.downloadSubtitles = function(event) {
        event.target.href = "data:text/plain;charset=utf-8," + encodeURIComponent(ytts.buildSubRip());
    }

    // Adds a first empty subtitle line.
    /*
    if (initSubtitles.length > 0) {
        for (sub of initSubtitles) {
            ytts.addSubtitle(sub);
        }
    } else {
        ytts.addSubtitle(null);
    }
    */

    // Drag events handlers for the subtitles.
    // Would have preferred to use x-moz-node to drag the DOM node,
    // but that's not a standard yet…
    ytts.dragstartSubtitle = function(ev) {
        console.log("dragStart");
        var oldDragged = document.getElementById("draggedSubtitle");
        if (oldDragged) {
            oldDragged.removeAttribute("id");
        }
        ev.target.parentNode.id = "draggedSubtitle";
        ev.dataTransfer.setData("text/plain", "draggedSubtitle");
        ev.dataTransfer.dropEffect = "copy";
    };
    ytts.dragover_handler = function(ev) {
        ev.preventDefault();
        ev.dataTransfer.dropEffect = "move";
    };
    ytts.drop_handler = function(ev) {
        ev.preventDefault();
        if (ev.dataTransfer.getData("text") == "draggedSubtitle") {
            var draggedSubtitle = document.getElementById("draggedSubtitle");
            var droppointSubtitle = ev.target.parentNode;
            var relativePosition = ev.target.getAttribute("data-subtitleinsert");
            if (relativePosition == "after") {
                droppointSubtitle = droppointSubtitle.nextSibling;
            }
            droppointSubtitle.parentNode.insertBefore(
                    draggedSubtitle,
                    droppointSubtitle);
            document.getElementById("draggedSubtitle").removeAttribute("id");
        }
    };

    // Progress bar
    var tsBarNow = document.getElementById("timestampBarNow");
    ytts.setCursorPercentage = function(percentage) {
        tsBarNow.style.left = percentage + "%";
    };
    ytts.setCursorTime = function(time) {
        seconds = timeToSeconds(time);
        tsBarNow.style.left = seconds*100/videoLength + "%";
        player.playVideo();
        player.seekTo(seconds);
        player.pauseVideo();
        ytts.displaySubtitlesAt(seconds);
    };
    ytts.setCursorAtSubtitle = function(ev) {
        var subtitleStart = ev.target.parentNode.querySelector("[data-subtitlestart]").value;
        if (!subtitleStart) {
            subtitleStart = "00:00:00";
        }
        ytts.setCursorTime(subtitleStart);
    };

    ytts.displaySubtitlesAt = function(seconds) {
        var lines = ytts.getActiveLines(seconds),
            activeLine = document.getElementById("activeLine");
        ytts.unhighlightSubtitles();
        if(lines.length === 0) {
            activeLine.innerHTML = "";
            return false;
        } else if(lines.length === 1) {
            activeLine.innerHTML = lines[0].querySelector("[data-subtitletext]").value;
            ytts.highlightSubtitle(lines);
            return true;
        } else if(lines > 1) {
            ytts.highlightSubtitle(lines);
            activeLine.innerHTML = "subtitles conflict";
            return false;
        }
    };

    ytts.getSubtitleNodes = function() {
        return document.getElementById("subtitles").querySelectorAll("[data-subtitle='true']");
    };

    ytts.highlightSubtitle = function(subtitles) {
        for(sub of subtitles) {
            sub.className = sub.className.replace(/[ ]?highlightedSubtitle/, "") + " highlightedSubtitle";
        }
    };

    ytts.unhighlightSubtitles = function() {
        var subs = ytts.getSubtitleNodes();
        for(sub of subs) {
            sub.className = sub.className.replace(/[ ]?highlightedSubtitle/, "");
        }
    };


    ytts.getActiveLines = function(seconds) {
        var subs = document.getElementById("subtitles").querySelectorAll("[data-subtitle='true']");
        var activeLines = [], tmpLine, tmpTimeStart, tmpTimeStop;
        for(var i=0; i<subs.length; i++) {
            tmpLine = subs[i];
            tmpTimeStart = tmpLine.querySelector("[data-subtitlestart]").value;
            tmpTimeStop = tmpLine.querySelector("[data-subtitlestop]").value;
            if(tmpTimeStart!="" && tmpTimeStop!=""
               && timeToSeconds(tmpTimeStart)<=seconds
               && timeToSeconds(tmpTimeStop)>=seconds
               ) {
                activeLines.push(tmpLine);
            }
        }
        return activeLines;
    };

    ytts.createSubtitles = function(versionToCreate, clonedFrom) {
        document.getElementById("current_version_name")
            .innerHTML = versionToCreate;
        ytts.currentVersion = versionToCreate;
        if(!clonedFrom) {
            ytts.clearSubtitlesView();
        }
        ytts.saveSubtitles();
    };

    ytts.updateSubtitlesView = function(subtitles_json) {
        ytts.clearSubtitlesView();
        var tmp_sub;
        for(var i=0; i<subtitles_json.length; i++) {
            tmp_sub = subtitles_json[i];
            console.log(tmp_sub);
            ytts.addSubtitle(tmp_sub);
        }
    };

    ytts.clearSubtitlesView = function() {
        document.getElementById("subtitles").innerHTML = "";
    };

    ytts.loadVideo = function(video_id) {
        ytts.loadSubtitle();
    }
    
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    ytts.initEventListeners();
}());
