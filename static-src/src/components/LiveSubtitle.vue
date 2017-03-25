<template>
<div id="liveSubtitle">{{ liveSubtitle }}</div>
</template>

<script>
import { mapState } from 'vuex';

import { timeToSeconds } from '../utils/utils.js';

export default {
    name: 'liveSubtitle',
    computed: {
        liveSubtitle () {
            let subs = this.$store.getters.currentSubtitles;
            if (!subs || subs.length === 0) {
                return "";
            } else if (subs.length === 1) {
                return subs[0].subtitle;
            } else if (subs.length > 1) {
                return "subtitles conflict";
            }
        }
    },      
}
</script>
