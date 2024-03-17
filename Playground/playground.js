// javascript notes and testing code

// get video element in youtube page
// TODO: check all possible functions or properties of this element
let vid = document.getElementById("movie_player")

// get current time of video, i.e. number of seconds since start of video
vid.getCurrentTime()

// separate Id from rest of video url
let split = vid.getVideoUrl().split("v=")

// gets the video Id
let videoId = split[1]

// view all items in local storage
console.log(chrome.storage.local.get(null));

// clear all items from local storage
chrome.storage.local.clear(() => {console.log("cleared storage.local")});

// sample json for response from API Gateway to get data about video and actors using videoId
// IMPORTANT: windows array should be sorted from beginning to end of video.
// will be done in the backenf and stored that way in the DB
let response = {
    "videoId": "someId123",
    "name": "someVideoName",
    "length": 100000, // in millis
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
            "start": 20500,
            "end": 35000,
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
}

// reworked schema
// CHANGES: contains two actor arrays - actorsToRemove and actorsToAdd
// actorsToRemobe includes all actors no longer in the scene that need to be removed from the display
// actorsToAdd includes all new actors in the scene that need to be added to the display
let responseNew = {
    "videoId": "someId123",
    "name": "someVideoName",
    "length": 100000, // in millis
    "windows": [
        {
            "start": 0,
            "actorsToRemove": [

            ],
            "actorsToAdd": [
                {
                    "actorId": "18ir8e0",
                    "name": "Jeff Bridges",
                    "urls": [
                        "www.imdb.com/name/nm0000313",
                        "www.wikidata.org/wiki/Q174843"
                    ]
                }
            ]
        },
        {
            "start": 20000,
            "actorsToRemove": [
                {
                    "actorId": "18ir8e0",
                    "name": "Jeff Bridges",
                    "urls": [
                        "www.imdb.com/name/nm0000313",
                        "www.wikidata.org/wiki/Q174843"
                    ]
                }
            ],
            "actorsToAdd": [
                {
                    "actorId": "3k2Xl",
                    "name": "Steve Buscemi",
                    "urls": [
                        "www.wikidata.org/wiki/Q104061",
                        "www.imdb.com/name/nm0000114"
                    ]
                }
            ]
        },
        {
            "start": 40000,
            "actorsToRemove": [
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
            ],
            "actorsToAdd": [
                
            ]
        }
    ]
}

// represent the most recent index in the windows array property
// this is done to optimize lookups
let mostRecent = 0

// get information about actors that appear in a single frame
// this could be run when the vide ois paused and the user clicks on a button
// to "recognize" the actors in the current frame
// since processing is done in the backend when the video is originally uploaded, the information will already exist
function getInfoWhenPaused() {
    let info = null;
    let vidCurrentTime = vid.getCurrentTime();
    console.log("Current video time (in seconds): " + vidCurrentTime)
    while (mostRecent < response['windows'].length) {
       let curr = response['windows'][mostRecent];
       if (curr['start'] / 1000 <= vidCurrentTime && curr['end'] / 1000 >= vidCurrentTime) {
        console.log("Selected a value");
        info = curr['actors'];
        break;
       }
       mostRecent++;
    }
    if (info == null) {
        return [];
    } else {
        return info;
    }
}

// do something with info received from the response for the current timestamp
// currently just prints to the console, but will render or pass along somehow for actual extension
function processCurrentInfo() {
    let info = getInfoWhenPaused();
    console.log("Actors in the current frame are: ");
    if (info.length == 0) {
        console.log("No information about actors in this scene...");
    } else {
        for (let actor of info) {
            console.log("Name: " + actor['name'] + ", Id: " + actor['actorId']);
            console.log("Urls: ");
            actor['urls'].forEach(url => console.log(url));
        }
    }
    console.log("Finished getting actors for this scene");
}

// var myTime = 10000

// var timeout = setTimeout(function(){
//     var interval = setInterval(function(){
//         var currentTime = vid.getCurrentTime()
//         if (currentTime >= myTime / 1000){
//             clearInterval(interval);
//             console.log("Arrived at time: " + currentTime)
//         }
//     },1000);
//   }, myTime-1000);

// process info about actors in current scene
// overloads function from above that does the exact same thing
function processCurrentInfo(info) {
    console.log("Actors in the current frame are: ");
    if (info.length == 0) {
        console.log("No information about actors in this scene...");
    } else {
        for (let actor of info) {
            console.log("Name: " + actor['name'] + ", Id: " + actor['actorId']);
            console.log("Urls: ");
            actor['urls'].forEach(url => console.log(url));
        }
    }
    console.log("Finished getting actors for this scene");
}


// create timeout event to log info when start time for this interval is reached from start of the video
// there is currently no validation regarding the video's current time
// the function simply sets a timeout from when called and triggers the callback when it finishes counting down
// from it 
function createEvent(window) {
    let time = window['start']
    console.log("Creating event for time: " + time)
    var timeout = setTimeout(() => {
        console.log("Event created at start of video, time: " + time)
        processCurrentInfo(window['actors'])
    }, time)
    console.log("Finsihed creating event for time: " + time)
    return timeout
}

// iterates over the repsonse object and creates timeout events for each window
// called at the start of the video and only works if user watches from the start without skipping anywhere,
// both forwards and backwards
function createEvents() {
    console.log("Started creating events")
    let windows = response['windows']
     for (let i = 0; i < windows.length; i++) {
        let window = windows[i]
        var timeout = createEvent(window)
        console.log("Created event for window: " + window + ", timeout result: " + timeout)
     }
     console.log("Finished creating events")
}