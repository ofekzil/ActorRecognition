
// create a div for displaying the actors overlayed on the video
function createDisplay(video) {
    let display = document.getElementById("actorsDisplay");
    if (display != null) {
        display.remove();
    }
    display = document.createElement("div");
    display.id = "actorsDisplay";
    display.class = "overlay";
    display.style.position = "relative";
    
    let title = document.createElement("h2");
    title.innerText = "Actors in Scene";
    title.id = "actorsTitle";
    
    let actors = document.createElement("div");
    actors.id = "actors";
    
    display.appendChild(title);
    display.appendChild(actors);

    let vidContainer = video.parentElement;
    video.pause();
    vidContainer.appendChild(display);   
}

// clear all existing actors in display 
function clearDisplay() {
    let actorsList = document.getElementById("actorsList");
    if (actorsList != null) {
        actorsList.remove();
    }
    let actorsDiv = document.getElementById("actors");
    actorsList = document.createElement("ul");
    actorsList.id = "actorsList";
    actorsDiv.appendChild(actorsList);
}

// render actors in current scene to display
// display their name and urls
function renderActors(actors, video) {
    clearDisplay();
    let actorsList = document.getElementById("actorsList");
    for (let actor of actors) {
        let actorDisplay = document.createElement("li");
        actorDisplay.id = actor['actorId'];
        let name = document.createElement("p");
        name.innerText = actor['name'];
        actorDisplay.appendChild(name);
        // PROBLEM: Left-clicking actor url opens link in new tab, but video then resumes playing, which clears the display
        actor['urls'].forEach(url => {
            let u = document.createElement("a");
            u.href = "https://" + url;
            u.innerText = (url.includes("imdb") ? "IMDb" : "Wikidata");
            u.style.color = "blue";
            u.style.textDecoration = "underline";
            u.style.padding = "2px";
            u.addEventListener("click", () => {
                // can change _blank to _self to open link in current tab
                // can be workaround to resolve problem
                window.open("https://" + url, "_blank").focus(); 
                video.pause();
            });
            actorDisplay.appendChild(u);
        })
        actorsList.appendChild(actorDisplay);
    }
}

// function to process current video info from provided response
// also calls functions to add to/remove from display
function getActors(vidCurrentTime, response) {
    let mostRecent = 0;
    let info = null;
    let windows = response['windows'];
    while (mostRecent < windows.length) {
       let curr = windows[mostRecent];
       if (curr['start'] / 1000 <= vidCurrentTime && (mostRecent == windows.length - 1
        || vidCurrentTime < windows[mostRecent+1]['start'] / 1000)) {
        info = curr['actors'];
        break;
       }
       mostRecent++;
    }
    return info;
}

// store response from API call in local storage
// set expiry time to be current time + two weeks
function cacheResponse(response, videoId, addToKey) {
    let toCache = {};
    let ttl = 1209600000; // two weeks
    let key = videoId + addToKey;
    toCache[key] = response;
    let now = new Date().getTime();
    toCache[key]['expiry'] = now + ttl;
    chrome.storage.local.set(toCache).then(() => {});
}



// get video info from DB using provided videoId
function getVideoInfo(videoId, addToKey) {
    const VIDEO_API_BASE_64 = "aHR0cHM6Ly92NDNlaHF1cWtnLmV4ZWN1dGUtYXBpLnVzLXdlc3QtMi5hbWF6b25hd3MuY29tL3RoZS1zdGFnZS9HZXRWaWRlbw==";
    const VIDEO_API = atob(VIDEO_API_BASE_64);
    let payload = {"videoId": videoId};
    let response = {};
    let request = new XMLHttpRequest();
    request.open("POST", VIDEO_API, false); // synchronous call!
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
            response = JSON.parse(request.responseText);
        }
    };
    request.send(JSON.stringify(payload));

    cacheResponse(response, videoId, addToKey);
    return response;
}

// remove the video info from chrome local storage if it is past expiration date
function removeExpired(key, response) {
    let expiryTime = response['expiry'];
    let currTime = new Date().getTime();
    if (currTime > expiryTime) {
        chrome.storage.local.remove(key).then((res) => {});
    }
}

// try to get video info from local chrome storage, otherwise retreive from the database
function getVideoFromCache(videoId, vid) {
    let response = null;
    const ADD_TO_KEY = "~abcd1234";
    let key = videoId + ADD_TO_KEY;
    chrome.storage.local.get(key)
        .then((result) => {
            response = result;
            let responseStr = JSON.stringify(response);
            if (responseStr == "{}" || response === null || response == {} || response.size == 0) {
                response = getVideoInfo(videoId, ADD_TO_KEY);
            } else {
                response = response[key];
            }
            let actors = getActors(vid.currentTime, response);
            if (actors === null) {
                alert("could not get info about actors in this scene");
            } else {
                renderActors(actors, vid);
            }
            removeExpired(key, response);
        });
    return response;
}



// recognize actors in current scene
// called from onClick handler
function recognizeActors() {
 
    // if there ar ever for whatever reason more video elements, will need to rework logic here,
    // though very unlikely this will happen
    let vid = document.getElementsByTagName("video")[0];
    let vidUrl = vid.baseURI;
    // PROBLEM - PARTIALLY RESOLVED: if navigating to new video after previous video, will display actors from previous video 
    //          until Recognize button is pressed again
    // (partial) SOLUTION: When navigating to new page, the video automatically starts playing, 
    //                     so it'll clear the actors from display
    vid.addEventListener("play", clearDisplay);
    createDisplay(vid); 

    // videoId to be used for retreiving video info from DB
    let videoId = vidUrl.split("v=")[1].split("&")[0];
    let response = getVideoFromCache(videoId, vid);
}

recognizeActors();
