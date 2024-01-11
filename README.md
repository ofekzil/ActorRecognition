# ActorRecognition

## Summary
This program is to recognize actors in videos and display a short summary of them (i.e. name, image, IMDb URL) in a browser extension in real-time.

## High-Level Design & AWS Services to Use

### Backend Pre-processing of Videos (done behind the scenes)
- Create a Youtube channel and upload short movie clips to it.
- Upload the same videos to Amazon S3. Will need to ensure the videos share a unique ID (e.g. Youtube's auto-generated ID).
- When a video is uploaded to S3, trigger a Lambda function to process that video and store the information.
- The Lambda calls AWS Rekognition to get all celebrity information from the video. 
- Rekognition sends back a response. This likely means it writes to a specified SNS topic, which can in turn trigger the Lambda (either same or different, need to check) and send the information (See above TODO).
- The Lambda then stores all information in a database, likely DynamoDB. Could also be a file.
- Must store data: video ID (primary key), actor name, timestamp(s) where the actor is visible, IMDb url.
- Optional data: Movie name/video title, (link to) profile picture, more somewhat relevant data (maybe for monitoring or reports).

### Client-side Extension
TODO
- Browser extension with the following functionalities:\
    1. Work on any Youtube video, though will only work with my videos. There will be no results for anything else.
    2. When a user clicks on a video, load all info required for this video from the database/file on AWS using resources/workflow outlined below.
    3. Display to the user in real-time the actors that are currently on screen. This includes name, possible profile picture, and possible IMDb url. At the very least, names.
- When the extension requests data for a video, it will call an API Gateway to invoke a Lambda.
- the Lambda function would use a given ID value from the extension (via API call), in order to retreive all necessary information from the database (or file).
- The database in question is the same one described in previous section.
- Return info to the extension and cache the values tp be used while video plays. This will be all ideally done before the video starts playing.
- After retreiving data, the extension will need to set triggers using the provided timestamps, so it knows when to display each actor.

### Questions & TODO
- Discover more about Rekognition and how it works (mess around with CLI and API).
- How do reuests and responses work?
- Where do responses from Rekognition go? Is it SNS, and if so, how is it best utilized?
- For data storage, what is the best way both in terms of space and efficiency? Is a database better (DynamoDB), or simply a file on perhaps S3?
- When an actor appears multiple times, what happens timestamp-wise? Do they send an event for every millisecond the actor appears? How do we know when they stop appearing?
- How do I set up triggers in the extension for displaying an actor using the timestamps provided and the current time in the video?
- Check out operations on video element (more in playground.js)
- How to get Youtube video ID from url or webpage
- Decide on best use of ID for videos. Who decides first what the video ID is, and how to best communicate that information between the different components (Youtube, extension, S3, database).
- How to best cache values at video start.