
// remove actors no longer in scene from display
// currently only logs actors' info, but will eventually render values
function removeActors(actorsToRemove) {
    console.log("Removing the following actors from display: ");
    for (let actor of actorsToRemove) {
        console.log("Name: " + actor['name'] + ", Id: " + actor['actorId']);
        console.log("Urls: ");
        actor['urls'].forEach(url => console.log(url));
    }
    console.log("Finished removing actors from frame");
}

// adds new actors to display 
// currently only logs actors' info, but will eventually render values
function addActors(actorsToAdd) {
    console.log("Adding the following actors to display: ");
    for (let actor of actorsToAdd) {
        console.log("Name: " + actor['name'] + ", Id: " + actor['actorId']);
        console.log("Urls: ");
        actor['urls'].forEach(url => console.log(url));
    }
    console.log("Finished adding actors to frame");
}

// function to process current video info from provided response
// also calls functions to add to/remove from display
// PROBLEM: What happens if somebody is at timestamp B, clicks RECOGNIZE, 
// then goes back to timestamp A, clicks recognize again? 
// Need to figure out a way to track that and address such cases
// POSSIBLE SOLUTION: Go back to one actors array
function processVideoInfo(vidCurrentTime, response) {
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
        info = curr;
        break;
       }
       mostRecent++;
    }
    if (info == null) {
        console.log("Could not get info about actors in scene");
    } else {
        removeActors(info['actorsToRemove']);
        addActors(info['actorsToAdd']);
    }
}

// recognize actors in current scene
// called from onClick handler
function recognizeActors() {
 
    // if there ar ever for whatever reason more video elements, will need to rework logic here,
    // though very unlikely this will happen
    let vid = document.getElementsByTagName("video")[0];
    console.log("Video selected: ");
    console.log("Video baseURI: " + vid.baseURI);
    console.log("Video currentTime: " + vid.currentTime); // IN SECONDS!!
    // hard-coded variable will be replaced by function call that returns response from DB
    let responseLebowski = {
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
    };

    processVideoInfo(vid.currentTime, responseLebowski);

    // if using, move commented out functions below to the top
    // processCurrentInfo(vid.currentTime);
}

recognizeActors();

// // PREVIOUS FUNCTIONS: If using, move to top of file
//
// // get info for current actors in scene after user clicks on button
// // repsonseLebowski is a sample response object from the API (major TODO)
// // TODO: work out schema for reponse object; can liekly remove end attribute, and have the ending of window A
// //      simply be the start of window B
// function getInfoWhenPaused(vidCurrentTime) {
//     // hard-coded variable will be replaced by function call that returns response from DB
//     let responseLebowski = {
//         "videoId": "someId123",
//         "name": "someVideoName",
//         "length": 100000, // in millis
//         "windows": [
//             {
//                 "start": 0,
//                 // "end": 20000,
//                 "actors": [
//                     {
//                         "actorId": "18ir8e0",
//                         "name": "Jeff Bridges",
//                         "urls": [
//                             "www.imdb.com/name/nm0000313",
//                             "www.wikidata.org/wiki/Q174843"
//                         ]
//                     },
//                     {
//                         "actorId": "3bH4eA5d",
//                         "name": "John Goodman",
//                         "urls": [
//                             "www.wikidata.org/wiki/Q215072"
//                         ]
//                     }
//                 ]
//             },
//             {
//                 "start": 20000,
//                 // "end": 35000,
//                 "actors": [
//                     {
//                         "actorId": "18ir8e0",
//                         "name": "Jeff Bridges",
//                         "urls": [
//                             "www.imdb.com/name/nm0000313",
//                             "www.wikidata.org/wiki/Q174843"
//                         ]
//                     },
//                     {
//                         "actorId": "3bH4eA5d",
//                         "name": "John Goodman",
//                         "urls": [
//                             "www.wikidata.org/wiki/Q215072"
//                         ]
//                     },
//                     {
//                         "actorId": "3k2Xl",
//                         "name": "Steve Buscemi",
//                         "urls": [
//                             "www.wikidata.org/wiki/Q104061",
//                             "www.imdb.com/name/nm0000114"
//                         ]
//                     }
//                 ]
//             }
//         ]
//     };
//     let mostRecent = 0;
//     let info = null;
//     console.log("Current video time (in seconds): " + vidCurrentTime)
//     while (mostRecent < responseLebowski['windows'].length) {
//         console.log("mostRecent: " + mostRecent);
//        let curr = responseLebowski['windows'][mostRecent];
//        if (curr['start'] / 1000 <= vidCurrentTime && curr['end'] / 1000 >= vidCurrentTime) {
//         console.log("Selected a value");
//         info = curr['actors'];
//         break;
//        }
//        mostRecent++;
//     }
//     if (info == null) {
//         return [];
//     } else {
//         return info;
//     }
// }

// // do something with info received from the response for the current timestamp
// // currently just prints to the console, but will render or pass along somehow for actual extension
// function processCurrentInfo(vidCurrentTime) {
//     let info = getInfoWhenPaused(vidCurrentTime);
//     console.log("Actors in the current frame are: ");
//     if (info.length == 0) {
//         console.log("No information about actors in this scene...");
//     } else {
//         for (let actor of info) {
//             console.log("Name: " + actor['name'] + ", Id: " + actor['actorId']);
//             console.log("Urls: ");
//             actor['urls'].forEach(url => console.log(url));
//         }
//     }
//     console.log("Finished getting actors for this scene");
// }