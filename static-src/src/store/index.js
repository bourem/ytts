import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);

import { getCookie } from '../utils/utils.js';

export default new Vuex.Store({
    state: {
        // view_init comes from the init values returned by Django.
        // Cf. ytts/templates/ytts/subtitles_editor.html.
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
    actions: {
        loadSubtitles ({ state, commit }, versionName) {
            axios.get("/ytts/" + state.video + "/load/", {
                params: {
                    version_name: versionName,
                },
                responseType: "json"
            }).then(function (response) {
                let payload = {
                    newSubtitles: response.data,
                    newVersion: versionName,
                };
                commit('setSubtitles', payload);
            });
        },
        saveSubtitles: function ({ state, commit }) {
            return new Promise((resolve, reject) => {
                commit('savingStarted');
                let url = "/ytts/" + state.video + "/save/";
                axios.post(url,
                    'subtitles_json=' + JSON.stringify(state.subtitles) + '&version_name=' + state.version,
                    {
                        headers: {
                            'Content-type': "application/x-www-form-urlencoded",
                            'X-CSRFToken': state.csrftoken
                        }
                    })
                    .then(function (response) {
                        commit('savingStopped');
                        if (response.status == "OK") {
                            commit('updateLastSave');
                        }
                        console.log(response);
                        resolve();
                    });
            });
        },
        createSubtitles: function ({ state, commit, dispatch }, payload) {
            let newSubtitlesPayload = {
                newVideo: state.video,
                newVersion: payload.version
            };
            if (!payload.isClone) {
                newSubtitlesPayload.newSubtitles = [];
            }
            commit('setSubtitles', newSubtitlesPayload);
            dispatch('saveSubtitles');
        }
    }
});
