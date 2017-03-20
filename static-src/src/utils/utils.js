function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Helper function to display seconds (output from YT API)
// to h:m:s (format for subtitles).
function secondsToTime(s) {
    var h = Math.floor(s/3600);
    if(h<10) { h = "0"+h;}
    var m = Math.floor((s%3600)/60);
    if(m<10) { m = "0"+m;}
    var s = (s%60).toFixed(3);
    if(s<10) { s = "0"+s;}
    return h+":"+m+":"+s.replace(".", ",");
}

function timeToSeconds(t) {
    var [h, m, s] = t.split(":");
    return parseInt(h)*3600 + parseInt(m)*60 + parseFloat(s.replace(",", "."));
}


export { getCookie, secondsToTime, timeToSeconds };
