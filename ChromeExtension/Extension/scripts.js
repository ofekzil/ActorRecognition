
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
    // hard-coded variable will be replaced by code that returns response from DB
    let response = {
        "videoId": "someId123",
        "video": {
            "videoId": "someId123",
            "name": "someVideoName",
            "bucket": "recognitionvideos",
            "lengthMillis": 100000
        },
        "windows": [
            {
                "start": 0,
                "end": 20000,
                "actors": [
                    {
                        "actorId": "18ir8e0",
                        "name": "Jeff Bridges",
                        "urls": [
                            "www.imdb.com/name/nm0000313",
                            "www.wikidata.org/wiki/Q174843"
                        ]
                    },
                    {
                        "actorId": "3bH4eA5d",
                        "name": "John Goodman",
                        "urls": [
                            "www.wikidata.org/wiki/Q215072"
                        ]
                    }
                ]
            },
            {
                "start": 20000,
                "end": 45000,
                "actors": [
                    {
                        "actorId": "18ir8e0",
                        "name": "Jeff Bridges",
                        "urls": [
                            "www.imdb.com/name/nm0000313",
                            "www.wikidata.org/wiki/Q174843"
                        ]
                    },
                    {
                        "actorId": "3bH4eA5d",
                        "name": "John Goodman",
                        "urls": [
                            "www.wikidata.org/wiki/Q215072"
                        ]
                    },
                    {
                        "actorId": "3k2Xl",
                        "name": "Steve Buscemi",
                        "urls": [
                            "www.wikidata.org/wiki/Q104061",
                            "www.imdb.com/name/nm0000114"
                        ]
                    }
                ]
            }
        ]
    };
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
    let videoId = vidUrl.split("v=")[1];
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