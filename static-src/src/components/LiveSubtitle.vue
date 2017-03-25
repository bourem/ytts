<template>
<div id="liveSubtitle">{{ liveSubtitle }}</div>
</template>

<script>
export default {
    name: 'liveSubtitle',
    computed: {
        liveSubtitle () {
            const subs = this.$store.getters.currentSubtitles;
            switch (subs.length) {
                case 0:
                    return "";
                    break;
                case 1:
                    return subs[0].subtitle;
                    break;
                default:
                    return "subtitles conflict";
            }
        }
    },      
}
</script>
