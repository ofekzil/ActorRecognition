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
            "end": 350000,
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