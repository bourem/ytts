<template>
    <div>
        <div id="subtitlesControls">
            <button id="subtitleControlAdd" v-on:click="addSubtitle">Add subtitle</button>
            <button v-on:click="saveSubtitles">Save subtitles</button>
            <a href="" id="subtitleControlDownload" download="subtitles.srt" v-on:click="downloadSubtitles">DL (SubRip)</a>
        </div>
        <div id="subtitles">
            <ytts-subtitle v-for="subtitle in subtitles" :subtitle="subtitle" :key="subtitle.subtitle"></ytts-subtitle>
        </div>
        <div id="savingFeedback" v-if="isSaving">Saving...</div>        
    </div>
</template>

<script>
import Subtitle from './Subtitle.vue';
import { mapState } from 'vuex';

export default {
    components: {
        "ytts-subtitle": Subtitle,
    },
    computed: mapState({
        subtitles: 'subtitles',
        isSaving: 'isSaving',
    }),
    methods: {
        addSubtitle: function () {
            this.$store.commit('addSubtitle');
        },
        saveSubtitles: function () {
            this.$store.dispatch('saveSubtitles');
        },
        toSubRip: function () {
            var subsFinalArray = [];
            var subs = this.subtitles;
            var tmpSubRow, tmpSubString;
            for(var i=0; i<subs.length; i++) {
                tmpSubRow = subs[i];
                tmpSubString = i + "\n";
                tmpSubString += tmpSubRow['start'] + "-->";
                tmpSubString += tmpSubRow['stop'] + "\n";
                tmpSubString += tmpSubRow['subtitle'] + "\n";
                subsFinalArray.push(tmpSubString);
            }
            var subsFinal = subsFinalArray.join("\n");
            return subsFinal;
        },
        downloadSubtitles: function(event) {
            event.target.href = "data:text/plain;charset=utf-8," + encodeURIComponent(this.toSubRip());
        },
    }
}
</script>
