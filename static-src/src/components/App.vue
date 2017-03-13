<template>
<div>
    <h1>Timestamper</h1>

    <div id="subtitlesVersions">
        
        <ytts-twostepsselection 
        :selected-option="loadedVersion" 
        :available-options="availableVersions" 
        v-on:select-option="$store.dispatch('loadSubtitles', $event)">
            <span slot="selected-label-text">Loaded version</span>
            <span slot="available-label-text">Available versions</span>
            <span slot="select-button-text">Load version</span>
        </ytts-twostepsselection>
        
        <span class="warning">If you decide to load another version the current work will be lost</span>

        <ytts-versioncreator></ytts-versioncreator>
    
    </div>

    <div id="ytplayer" :data-initvideoid="loadedVideo"></div>

    <div id="timestampBar">
        <div id="timestampBarNow"></div>
    </div>

    <div id="activeLine"></div>

    <ytts-subtitles></ytts-subtitles>
</div>
</template>

<script>
import { mapState } from 'vuex';

import TwoStepsSelection from './TwoStepsSelection.vue';
import SubtitlesList from './SubtitlesList.vue';
import VersionCreator from './VersionCreator.vue';

export default {
    name: 'app',
    components: {
        "ytts-twostepsselection": TwoStepsSelection,
        "ytts-subtitles": SubtitlesList,
        "ytts-versioncreator": VersionCreator,
    },
    computed: mapState({
        loadedVersion: 'version',
        loadedVideo: 'video',
        availableVersions: 'availableVersions',
    }),
    methods: {
        loadVersion: function (versionName) {
            this.$store.dispatch('loadSubtitles', versionName);
        }
    }
}
</script>
