import { timeToSeconds } from "../utils/utils.js";

export const currentSubtitles = (state, getters) => {
    return state.subtitles.filter(subtitle => {
        const seconds = state.videoCurrentTime;
        return (subtitle.start != "" && subtitle.stop != ""
                && timeToSeconds(subtitle.start) <= seconds
                && timeToSeconds(subtitle.stop) >= seconds)
    })
}
