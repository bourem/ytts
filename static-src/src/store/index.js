import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);
import axios from 'axios';

import { getCookie } from '../utils/utils.js';

import * as actions from './actions.js';

export default new Vuex.Store({
    state: {
        // view_init comes from the init values returned by Django.
        // Cf. ytts/templates/ytts/subtitles_editor.html.
        // This is obviously less than ideal.
        // TODO: improve this, for example by moving the view_init 
        // acquisition in some utils function.
        subtitles: view_init.subtitles,
        video: view_init.video,
        version: view_init.version,
        availableVersions: view_init.versions,
        csrftoken: getCookie('csrftoken'),
        isSaving: false,
        lastSaveTime: null
    },
    mutations: {
        setSubtitles (state, payload) {
            if (payload.newSubtitles) state.subtitles = payload.newSubtitles;
            if (payload.newVersion) state.version = payload.newVersion;
            if (payload.newVideo) state.video = payload.newVideo;
        },
        addSubtitle (state, payload) {
            let newSubtitle = {};
            if (payload) {
                newSubtitle = {
                    subtitle: payload.subtitle,
                    start: payload.start,
                    stop: payload.stop,
                };
            }
            state.subtitles.push(newSubtitle);
        },
        savingStarted (state) {
            state.isSaving = true;
        },
        savingStopped (state) {
            state.isSaving = false;
        },
        updateLastSave () {
            state.lastSaveTime = Date.now();
        }
    },
    actions,
});
