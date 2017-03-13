export const setSubtitles = (state, payload) => {
    if (payload.newSubtitles) state.subtitles = payload.newSubtitles;
    if (payload.newVersion) state.version = payload.newVersion;
    if (payload.newVideo) state.video = payload.newVideo;
};
export const addSubtitle = (state, payload) => {
    let newSubtitle = {};
    if (payload) {
        newSubtitle = {
            subtitle: payload.subtitle,
            start: payload.start,
            stop: payload.stop,
        };
    }
    state.subtitles.push(newSubtitle);
};
export const savingStarted = (state) => {
    state.isSaving = true;
};
export const savingStopped = (state) => {
    state.isSaving = false;
};
export const updateLastSave = () => {
    state.lastSaveTime = Date.now();
};
