import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);
import TwoStepsSelection from './components/TwoStepsSelection.vue';
import SubtitlesList from './components/SubtitlesList.vue';

window.ytts = {};

    Vue.prototype.$http = axios;
    
    const store = new Vuex.Store({
        state: {
            subtitles: view_init.subtitles,
            video: view_init.video,
            version: view_init.version,
            availableVersions: view_init.versions,
            csrftoken: getCookie('csrftoken'),
            isSaving: false,
            lastSaveTime: null
        },
        mutations: {
            setSubtitles (state, payload) {
                if (payload.newSubtitles) state.subtitles = payload.newSubtitles;
                if (payload.newVersion) state.version = payload.newVersion;
                if (payload.newVideo) state.video = payload.newVideo;
            },
            addSubtitle (state, payload) {
                let newSubtitle = {};
                if (payload) {
                    newSubtitle = {
                        subtitle: payload.subtitle,
                        start: payload.start,
                        stop: payload.stop,
                    };
                }
                state.subtitles.push(newSubtitle);
            },
            savingStarted (state) {
                state.isSaving = true;
            },
            savingStopped (state) {
                state.isSaving = false;
            },
            updateLastSave () {
                state.lastSaveTime = Date.now();
            }
        },
        actions: {
            loadSubtitles ({ state, commit }, versionName) {
                axios.get("/ytts/" + state.video + "/load/", {
                    params: {
                        version_name: versionName,
                    },
                    responseType: "json"
                }).then(function (response) {
                    let payload = {
                        newSubtitles: response.data,
                        newVersion: versionName,
                    };
                    commit('setSubtitles', payload);
                });
            },
            saveSubtitles: function ({ state, commit }) {
                return new Promise((resolve, reject) => {
                    commit('savingStarted');
                    let url = "/ytts/" + state.video + "/save/";
                    axios.post(url,
                        'subtitles_json=' + JSON.stringify(state.subtitles) + '&version_name=' + state.version,
                        {
                            headers: {
                                'Content-type': "application/x-www-form-urlencoded",
                                'X-CSRFToken': state.csrftoken
                            }
                        })
                        .then(function (response) {
                            commit('savingStopped');
                            if (response.status == "OK") {
                                commit('updateLastSave');
                            }
                            console.log(response);
                            resolve();
                        });
                });
            },
            createSubtitles: function ({ state, commit, dispatch }, payload) {
                let newSubtitlesPayload = {
                    newVideo: state.video,
                    newVersion: payload.version
                };
                if (!payload.isClone) {
                    newSubtitlesPayload.newSubtitles = [];
                }
                commit('setSubtitles', newSubtitlesPayload);
                dispatch('saveSubtitles');
            }
        }
    });

    Vue.component('ytts-versioncreator', {
        template: "#versionCreatorTemplate",
        data: function () {
            return {
                newVersion: "",
                isClone: true,
            }
        },
        computed: Vuex.mapState({
            subtitles: 'subtitles',
            isSaving: 'isSaving',
        }),
        methods: {
            createVersion: function () {
                var isClone = this.isClone;
                this.$store.dispatch(
                        'createSubtitles', 
                        {
                            version: this.newVersion, 
                            isClone: this.isClone
                        }
                );
            }
        }
    });

    window.vYttsApp = new Vue({
        components: {
            "ytts-twostepsselection": TwoStepsSelection,
            "ytts-subtitles": SubtitlesList,
        },
        el: "#yttsApp",
        store,
        computed: Vuex.mapState({
            loadedVersion: 'version',
            loadedVideo: 'video',
            availableVersions: 'availableVersions',
        }),
        methods: {
            loadVersion: function (versionName) {
                this.$store.dispatch('loadSubtitles', versionName);
            }
        }
    });

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
            videoId: view_init.video,
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

