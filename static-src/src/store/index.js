import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);

import { getCookie } from '../utils/utils.js';

import * as actions from './actions.js';
import * as mutations from './mutations.js';

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
    mutations,
    actions,
});
