
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
    console.log("Beginning to clear actors from display");
    let actorsList = document.getElementById("actorsList");
    if (actorsList != null) {
        console.log("Actors are in display, clearing");
        actorsList.remove();
    }
    let actorsDiv = document.getElementById("actors");
    actorsList = document.createElement("ul");
    actorsList.id = "actorsList";
    actorsDiv.appendChild(actorsList);
    console.log("Finished clearing actors from display");
}

// render actors in current scene to display
// display their name and urls
function renderActors(actors, video) {
    clearDisplay();
    console.log("Adding the following actors to display: ");
    let actorsList = document.getElementById("actorsList");
    for (let actor of actors) {
        console.log("Name: " + actor['name'] + ", Id: " + actor['actorId']);
        console.log("Urls: ");
        actor['urls'].forEach(url => console.log(url));
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
                console.log("video: " + video);
                video.pause();
            });
            actorDisplay.appendChild(u);
        })
        actorsList.appendChild(actorDisplay);
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

// store response from API call in local storage
// set expiry time to be current time + two weeks
function cacheResponse(response, videoId) {
    console.log("storing response in local cache");
    let toCache = {};
    let ttl = 1209600000; // two weeks
    toCache[videoId] = response;
    let now = new Date().getTime();
    toCache[videoId]['expiry'] = now + ttl;
    chrome.storage.local.set(toCache)
    .then(() => {console.log("cached response in chrome.storage.local")});
}



// get video info from DB using provided videoId
function getVideoInfo(videoId) {
    console.log("Begin logic to retreive video info from DB");
    const VIDEO_API_BASE_64 = "aHR0cHM6Ly92NDNlaHF1cWtnLmV4ZWN1dGUtYXBpLnVzLXdlc3QtMi5hbWF6b25hd3MuY29tL3RoZS1zdGFnZS9HZXRWaWRlbw==";
    const VIDEO_API = atob(VIDEO_API_BASE_64);
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
    cacheResponse(response, videoId);
    return response;
}

// remove the video info from chrome local storage if it is past expiration date
function removeExpired(videoId, response) {
    let expiryTime = response['expiry'];
    console.log("Expiry time: " + expiryTime);
    let currTime = new Date().getTime();
    console.log("Current time: " + currTime);
    if (currTime > expiryTime) {
        chrome.storage.local.remove(videoId)
        .then((res) => {
            console.log("Removed video with Id " + videoId + " from local storage");
            console.log(JSON.stringify(res));
        });
    }
}

// try to get video info from local chrome storage, otherwise retreive from the database
function getVideoFromCache(videoId, vid) {
    let response = null;
    chrome.storage.local.get(videoId)
        .then((result) => {
            console.log("Result received from chrome storage: ");
            console.log(JSON.stringify(result));
            response = result;
            let responseStr = JSON.stringify(response);
            if (responseStr == "{}" || response === null || response == {} || response.size == 0) {
                console.log("response is null")
                response = getVideoInfo(videoId);
            } else {
                response = response[videoId];
            }
            let actors = getActors(vid.currentTime, response);
            if (actors === null) {
                console.log("could not get info about actors in this scene");
            } else {
                renderActors(actors, vid);
            }
            removeExpired(videoId, response);
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
    console.log("Video selected: ");
    console.log("Video baseURI: " + vidUrl);
    console.log("Video currentTime: " + vid.currentTime); // IN SECONDS!!

    // videoId to be used for retreiving video info from DB
    let videoId = vidUrl.split("v=")[1].split("&")[0];
    console.log("videoId: " + videoId)
    let response = getVideoFromCache(videoId, vid);
    console.log(JSON.stringify(response))
}

recognizeActors();
