<template>
    <div>
        Create new version: 
        <input id="versionToCreate" type="text" maxlength="20" placeholder="name (max 20 chars)" v-model="newVersion">
        Clone current:<input id="versionIsClone" type="checkbox" value="clone" v-model="isClone">
        <button id="versionControlCreate" v-on:click="createVersion">Create New Version</button>
    </div>
</template>

<script>
import { mapState } from "vuex";

export default {
    data: function () {
        return {
            newVersion: "",
            isClone: true,
        }
    },
    computed: mapState({
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
}
</script>
