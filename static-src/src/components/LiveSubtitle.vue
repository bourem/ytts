<template>
<div id="liveSubtitle">{{ currentSubtitle.subtitle }}</div>
</template>

<script>
import { mapState } from 'vuex';

import { timeToSeconds } from '../utils/utils.js';

export default {
    name: 'liveSubtitle',
    data: function () {
        return {currentSubtitle:{subtitle:""}}
    },
    computed: mapState(["videoCurrentTime","subtitles"]),
    watch: {
        videoCurrentTime: function (val, oldVal) {
            const lines = this.getActiveLines();
            ytts.unhighlightSubtitles();
            if (lines.length === 0) {
                this.currentSubtitle = "";
            } else if (lines.length === 1) {
                this.currentSubtitle = lines[0];
            } else if (lines > 1) {
                this.currentSubtitle = "subtitles conflict";
            }
        }
    },
    methods: {
        getActiveLines: function () {
            let seconds = this.videoCurrentTime;
            let subs = this.subtitles;
            var activeLines = [], tmpLine, tmpTimeStart, tmpTimeStop;
            for (var i=0; i<subs.length; i++) {
                tmpLine = subs[i];
                tmpTimeStart = tmpLine.start;
                tmpTimeStop = tmpLine.stop;
                if(tmpTimeStart!="" && tmpTimeStop!=""
                   && timeToSeconds(tmpTimeStart)<=seconds
                   && timeToSeconds(tmpTimeStop)>=seconds
                   ) {
                    activeLines.push(tmpLine);
                }
            }
            return activeLines;
        },
    },
}
</script>
