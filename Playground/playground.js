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