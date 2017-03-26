<template>
    <div class="subtitle" v-bind:class="{ currentSubtitle: isCurrentSubtitle }">
        <div data-subtitleinsert="before" draggable="true" ondragover="ytts.dragover_handler(event)" ondrop="ytts.drop_handler(event)" ondragstart="ytts.dragstartSubtitle(event)"></div>
        <textarea data-subtitletext placeholder="Subtitle content" v-model="subtitle.subtitle"></textarea>
        <input type="text" placeholder="hh:mm:ss,sss" data-subtitlestart v-model="subtitle.start" />
        <input type="text" placeholder="hh:mm:ss,sss" data-subtitlestop v-model="subtitle.stop" />
        <button v-on:click="setStart">Start here</button>
        <button v-on:click="setStop">Stop here</button>
        <button onclick="ytts.setCursorAtSubtitle(event)">Position in Video</button>
        <div data-subtitleinsert="after" draggable="true" ondragover="ytts.dragover_handler(event)" ondrop="ytts.drop_handler(event)" ondragstart="ytts.dragstartSubtitle(event)"></div>
    </div>
</template>

<script>
import { secondsToTime } from '../utils/utils.js';

export default {
    props: ['subtitle'],
    data: function () {
        return {}
    },
    computed: {
        isCurrentSubtitle () {
            const subs = this.$store.getters.currentSubtitles;
            if (subs.indexOf(this.subtitle) >= 0) {
                return true;
            } else {
                return false;
            }
        }
    },
    methods: {
        setStart: function() {
            var startTimestamp = secondsToTime(this.$store.state.videoCurrentTime);
            this.subtitle.start = startTimestamp;
        },
        setStop: function() {
            var stopTimestamp = secondsToTime(this.$store.state.videoCurrentTime);
            this.subtitle.stop = stopTimestamp;
        }
    }
}
</script>
