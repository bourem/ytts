import axios from 'axios';

export const loadSubtitles = ({ state, commit }, versionName) => {
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
};

export const saveSubtitles = ({ state, commit }) => {
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
};

export const createSubtitles = ({ state, commit, dispatch }, payload) => {
    let newSubtitlesPayload = {
        newVideo: state.video,
        newVersion: payload.version
    };
    if (!payload.isClone) {
        newSubtitlesPayload.newSubtitles = [];
    }
    commit('setSubtitles', newSubtitlesPayload);
    dispatch('saveSubtitles');
};
