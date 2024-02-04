

// get info for current actors in scene after user clicks on button
// repsonseLebowski is a sample response object from the API (major TODO)
// TODO: work out schema for reponse object; can liekly remove end attribute, and have the ending of window A
//      simply be the start of window B
function getInfoWhenPaused(vidCurrentTime) {
    let responseLebowski = {
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
    };
    let mostRecent = 0;
    let info = null;
    console.log("Current video time (in seconds): " + vidCurrentTime)
    while (mostRecent < responseLebowski['windows'].length) {
        console.log("mostRecent: " + mostRecent);
       let curr = responseLebowski['windows'][mostRecent];
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
function processCurrentInfo(vidCurrentTime) {
    let info = getInfoWhenPaused(vidCurrentTime);
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

// recognize actors in current scene
// called from onClick handler
function recognizeActors() {
    // currently a loop, can probably turn into simply selecting first element
    // let vids = document.getElementsByTagName("video");
    // console.log("Videos selected: ");
    // Array.from(vids).forEach(vid => {
    //     console.log("Video baseURI: " + vid.baseURI);
    //     console.log("Current time: " + vid.currentTime);
    // });

    let vid = document.getElementsByTagName("video")[0];
    console.log("Video selected: ");
    console.log("Video baseURI: " + vid.baseURI);
    console.log("Video currentTime: " + vid.currentTime); // IN SECONDS!!

    processCurrentInfo(vid.currentTime);

}

recognizeActors();