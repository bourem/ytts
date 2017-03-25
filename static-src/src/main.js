import Vue from 'vue';
import store from './store';
import App from './components/App.vue';
import { timeToSeconds } from './utils/utils.js';

window.ytts = {};

window.vYttsApp = new Vue({
    el: "#yttsApp",
    store,
    render: h => h(App),
});

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
ytts.setCursorPercentage = function (percentage) {
    tsBarNow.style.left = percentage + "%";
};

ytts.setCursorTime = function (time) {
    seconds = timeToSeconds(time);
    tsBarNow.style.left = seconds*100/videoLength + "%";
    player.playVideo();
    player.seekTo(seconds);
    player.pauseVideo();
    ytts.displaySubtitlesAt(seconds);
};

ytts.setCursorAtSubtitle = function (ev) {
    var subtitleStart = ev.target.parentNode.querySelector("[data-subtitlestart]").value;
    if (!subtitleStart) {
        subtitleStart = "00:00:00";
    }
    ytts.setCursorTime(subtitleStart);
};
