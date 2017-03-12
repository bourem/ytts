<template>
    <div class="subtitle" data-subtitle='true'>
        <div data-subtitleinsert="before" draggable="true" ondragover="ytts.dragover_handler(event)" ondrop="ytts.drop_handler(event)" ondragstart="ytts.dragstartSubtitle(event)"></div>
        <textarea data-subtitletext v-model="subtitle.subtitle"></textarea>
        <input type="text" data-subtitlestart v-model="subtitle.start" />
        <input type="text" data-subtitlestop v-model="subtitle.stop" />
        <button v-on:click="setStart">Start here</button>
        <button v-on:click="setStop">Stop here</button>
        <button onclick="ytts.setCursorAtSubtitle(event)">Position in Video</button>
        <div data-subtitleinsert="after" draggable="true" ondragover="ytts.dragover_handler(event)" ondrop="ytts.drop_handler(event)" ondragstart="ytts.dragstartSubtitle(event)"></div>
    </div>
</template>

<script>
export default {
    props: ['subtitle'],
    data: function () {
        return {}
    },
    methods: {
        setStart: function() {
            var startTimestamp = secondsToTime(player.getCurrentTime());
            this.subtitle.start = startTimestamp;
        },
        setStop: function() {
            var startTimestamp = secondsToTime(player.getCurrentTime());
            this.subtitle.stop = startTimestamp;
        }
    }
}
</script>
