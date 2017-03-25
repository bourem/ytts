<template>
<div id="ytplayer"></div>
</template>

<script>
import { mapState } from 'vuex';

export default {
    name: 'ytplayer',
    data: function () {
        return {
            player: null,
            time: null,
            timeRefreshTimer: null,
        }
    },
    computed: mapState(["video"]),
    watch: {
        video: function (val, oldVal) {
            this.player.cueVideoById(
                {
                    videoId: val,
                    startSeconds: 0,
                });
        },
        time: function (val, oldVal) { 
            this.$store.commit('updateCurrentTime', {
                time: val
            });
        }
    },
    beforeCreate: function () {
        // Automatically called when Youtube iFrame API has been loaded.
        // Making it global for the API to see it.
        window.onYouTubeIframeAPIReady = function() {
            this.initPlayer();
        }.bind(this);

        // Youtube iFrame API load
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    },
    methods: {
        initPlayer: function () {
            this.player = new YT.Player('ytplayer', {
                videoId: this.video,
                events: {
                    'onReady': this.onPlayerReady,
                    'onStateChange': this.onPlayerStateChange
                }
            });
        },
        onPlayerReady: function (event) {
            this.$store.commit('setVideoTotalTime', {
                time: event.target.getDuration()
            });
        },
        onPlayerStateChange: function (event) {
            switch(event.data){
                case YT.PlayerState.PLAYING:
                    this.timeRefreshTimer = setInterval(
                        function(){
                            this.time = this.player.getCurrentTime();
                        }.bind(this), 
                        200);
                    break;
                default:
                    clearInterval(this.timeRefreshTimer);
            }
        }
    }
};
</script>
