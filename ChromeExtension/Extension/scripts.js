

// clear all existing actors in frame to 
function clearDisplay() {
    console.log("Beginning to clear actors from display");
    // add condition to check if display is empty (if possible)
    console.log("Actors are in display, clearing");
    // clear actors from display
    console.log("Finished clearing actors from display");
}

// render actors in current scene to frame
function renderActors(actors) {
    clearDisplay();
    console.log("Adding the following actors to display: ");
    for (let actor of actors) {
        console.log("Name: " + actor['name'] + ", Id: " + actor['actorId']);
        console.log("Urls: ");
        actor['urls'].forEach(url => console.log(url));
    }
    console.log("Finished adding actors to frame");
}

// function to process current video info from provided response
// also calls functions to add to/remove from display
function getActors(vidCurrentTime, response) {
    let mostRecent = 0;
    let info = null;
    let windows = response['windows'];
    console.log("Current video time (in seconds): " + vidCurrentTime);
    while (mostRecent < windows.length) {
        console.log("mostRecent: " + mostRecent);
       let curr = windows[mostRecent];
       if (curr['start'] / 1000 <= vidCurrentTime && (mostRecent == windows.length - 1
        || vidCurrentTime < windows[mostRecent+1]['start'] / 1000)) {
        console.log("Selected a value");
        info = curr['actors'];
        break;
       }
       mostRecent++;
    }
    return info;
}


// get video info from DB using provided videoId
function getVideoInfo(videoId) {
    console.log("Begin logic to retreive video info from DB");
    const VIDEO_API = "https://v43ehquqkg.execute-api.us-west-2.amazonaws.com/the-stage/GetVideo"; // check if it can become a global variable (or hidden from view)
    let payload = {"videoId": videoId};
    let response = {};
    let request = new XMLHttpRequest();
    request.open("POST", VIDEO_API, false); // synchronous call!
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
            console.log("request.responseText: " + request.responseText);
            response = JSON.parse(request.responseText);
        }
    };
    request.send(JSON.stringify(payload));

    console.log("response: " + JSON.stringify(response))
    console.log("Retreived video info from DB");
    return response;
}


// recognize actors in current scene
// called from onClick handler
function recognizeActors() {
 
    // if there ar ever for whatever reason more video elements, will need to rework logic here,
    // though very unlikely this will happen
    let vid = document.getElementsByTagName("video")[0];
    let vidUrl = vid.baseURI;
    console.log("Video selected: ");
    console.log("Video baseURI: " + vidUrl);
    console.log("Video currentTime: " + vid.currentTime); // IN SECONDS!!

    // videoId to be used for retreiving video info from DB
    let videoId = vidUrl.split("v=")[1].split("&")[0];
    console.log("videoId: " + videoId)
    
    let response = getVideoInfo(videoId);

    let actors = getActors(vid.currentTime, response);
    if (actors === null) {
        console.log("could not get info about actors in this scene");
    } else {
        renderActors(actors);
    }
}

recognizeActors();