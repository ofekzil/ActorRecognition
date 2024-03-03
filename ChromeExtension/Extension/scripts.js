
// create a div for displaying the actors overlayed on the video
function createDisplay(video) {
    let display = document.getElementById("actorsDisplay");
    if (display != null) {
        display.remove();
    }
    let vidContainer = video.parentElement;
    display = document.createElement("div");
    display.id = "actorsDisplay";
    display.class = "overlay";
    display.style.position = "absolute";
    display.style.top = 50;
    let title = document.createElement("h2");
    title.innerText = "Actors in Scene";
    title.id = "actorsTitle";
    let actors = document.createElement("div");
    actors.id = "actors";
    display.appendChild(title);
    display.appendChild(actors);
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
    let actorsDiv = document.getElementById("actorsDisplay");
    actorsList = document.createElement("ul");
    actorsList.id = "actorsList";
    actorsDiv.appendChild(actorsList);
    console.log("Finished clearing actors from display");
}

// render actors in current scene to display
// display their name and urls
function renderActors(actors) {
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
        // PROBLEM: If simply left-clicking on url, will interact with video instead of going to new page (e.g. IMDb)
        //          Works if right-click -> open in new tab
        actor['urls'].forEach(url => {
            let u = document.createElement("a");
            u.href = "https://" + url;
            u.innerText = (url.includes("imdb") ? "IMDb" : "Wikidata") + " ";
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
    // PROBLEM: if navigating to new video after previous video, will display actors from previous video 
    //          until Recognize button is pressed again
    createDisplay(vid); 
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