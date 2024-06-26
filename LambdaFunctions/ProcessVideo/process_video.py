# !!!!!!!!!!!!ALWAYS MAKE SURE LAMBDA IS UPDTED WITH LATEST CODE BEFORE RUNNING!!!!!!!!!!!!!!!!!!

# code for lambda to process the result of a start-celebrity-recognition call
# the lambda is subscribed to an SNS topic that rekognition sends the result to

# before invoking this lambda, we need to do configuration for SNS subscription for lambda, permissions for using rekognition
# which involves creating different roles, 

# ideally this processing lambda will also calculate the windows/durartions each actor will appear on screen at a time
# (using a custom algorithm), then store the results in some database

# this code is modelled on SNS-Lambda configuration tutorial in AWS docs
import boto3
import json
import logging

log = logging.getLogger()
log.setLevel(logging.INFO)

MARGIN_OF_ERROR = 10000

rekognition_client = boto3.client('rekognition')

s3_client = boto3.client('s3')

dynamodb_resource = boto3.resource('dynamodb')


def lambda_handler(event, context):
    log.info("Entering process_video lambda function for processing rekognition results and writing to DynamoDB")
    for record in event['Records']:
        process_message(record)
    log.info("Entering process_video lambda function for processing rekognition results and writing to DynamoDB")

# process SNS message receieved in Lambda trigger event
def process_message(record):
    try:
        message = record['Sns']['Message']
        log.debug(f"Processed message {message}")
        message_json = json.loads(message)
        jobId = message_json['JobId']
        log.info("JobId: " + jobId)
        response = rekognition_client.get_celebrity_recognition(JobId=jobId, SortBy='TIMESTAMP')
        log.info("Response from get_celebrity_recognition: ")
        log.info(json.dumps(response))

        processed_video_actors = process_video(response)
        
        write_to_db(processed_video_actors)
        
    except Exception as e:
        log.error("An error occurred when processing SNS message of rekognition results")
        log.error(f"SNS message: {message}")
        log.error(e)
        raise e


# process a result json of video analyzed by rekognition 
# return a json representation of processed data to write to DynamoDB 
def process_video(video):
    log.info("Starting video processing")
    # sample json template for reuslt of analyzed video
    video_processed = {
        "videoId": "",
        "name": video['Video']['S3Object']['Name'],
        "bucket": video['Video']['S3Object']['Bucket'],
        "lengthMillis": video['VideoMetadata']['DurationMillis']
    }

    video_id = get_video_id(bucket=video_processed['bucket'], key=video_processed['name'])
    video_processed['videoId'] = video_id

    # pass this array to group_actors()
    actors_processed = get_actors(video['Celebrities'])
    grouped_actors = group_actors(actors_processed)

    log.info("Finished processing video")

    return {
        'videoId': video_id,
        'video': video_processed,
        'windows': grouped_actors
    }


# prepare actors as input for group_actors
def get_actors(celebs):
    actors = []
    for celeb in celebs:
        actor = {
            'timestamp': celeb['Timestamp'],
            'info': {
                'actorId': celeb['Celebrity']['Id'],
                'name': celeb['Celebrity']['Name'],
                'urls': celeb['Celebrity']['Urls']
            }
        }
        actors.append(actor)
    return actors


# gets the video id from the object tags
def get_video_id(bucket, key):
    log.info(f"Getting tags for video in bucket = {bucket}, with key/name = {key}")
    tags = s3_client.get_object_tagging(Bucket=bucket, Key=key)
    log.info("Received tags: ")
    log.info(json.dumps(tags))
    video_id = tags['TagSet'][0]['Value']
    log.info("VideoId: " + video_id)
    return video_id


# function to put actors into timestamp groups
# will be like a sliding window algorithm that would determine whihc actors to show
# are together in a certain time window
# will look at the different actors' start & end timestamps and would determine that way
# an acceptable margin of error for when an actor is on-screen is +/-10 seconds from end/start (flexible)

# NOTE: Can also add filter for min confidence level and store results in DB accordingly
#       For example, we might say we only look at results where Rekognition's confidence level in recognizing 
#       a specific actor is at least 85%, and anything below that we don't process.
#       We can then store these results in a different table, and perhaps add an option in the extension
#       for a minimum confidence level in recognition.

# Sample result schema can be viewed in ChromeExtension/Extension/scripts.js
# Tentative algorithm steps:
# 1. Sort actors array by timetamp (ascending); Can do in get_celebrity_recognition call
# 2. Create the following local variables:
#   - windows: result array with all groups
#   - curr_group: current group of actors to add to
#   - actor_timestamps: dict of each actor's most recent timestamp for appearance in the video
#                       will be of format {actorId : timestamp}
#                       might also turn timestamp to an array of all of an actor's timestamps (if needed)
# 3. for actor in actors:
#       if actor in curr_group:
#           if actor['Timestamp'] >= curr_group['end'] + MARGIN_OF_ERROR (predefined margin of error - 10 secs currently):
#               add curr_group to windows
#               create new curr_group and add actor and timestamp to it 
#               update actor_timestamps and curr_group['end']
#           else:
#               update actor_timestamps
#       else if actor['Timestamp'] <= curr_group['end'] + MARGIN_OF_ERROR (predefined second margin of error - 10 secs currently):
#           add actor to curr_group 
#           update actor_timestamps and curr_group['end']
#       else:
#           add curr_group to windows 
#           create new group with actor and timestamp
#           update actor_timestamps and curr_group['end']
# 4. add curr_group to windows
# 5. return windows
def group_actors(actors):
    windows = []
    curr_group = {
        "start": 0,
        "end": 0,
        "actors": []
    }
    actor_timestamps = {}

    for actor in actors:
        if actor['info'] in curr_group['actors']:
            if actor['timestamp'] >= curr_group['end'] + MARGIN_OF_ERROR:
                prev_group = curr_group
                windows.append(curr_group)
                curr_group = {
                    "start": actor['timestamp'],
                    "end": actor['timestamp'],
                    "actors": [
                        actor['info']
                    ]
                }
                curr_group = check_rest_actors(prev_group, curr_group, actor_timestamps, actor['info']['actorId'])
            else :
                curr_group['end'] = actor['timestamp']
        elif actor['timestamp'] <= curr_group['end'] + MARGIN_OF_ERROR:
            curr_group['actors'].append(actor['info'])
            curr_group['end'] = actor['timestamp']
        else:
            windows.append(curr_group)
            prev_group = curr_group
            curr_group = {
                    "start": actor['timestamp'],
                    "end": actor['timestamp'],
                    "actors": [
                        actor['info']
                    ]
                }
            # might be unnecessary/useless
            curr_group = check_rest_actors(prev_group, curr_group, actor_timestamps, actor['info']['actorId'])
        actor_timestamps[actor['info']['actorId']] = actor['timestamp']

    windows.append(curr_group)
    return windows

# determine whether of the actors from prev_group 
# should be added to newly created curr_group
# it might be useless, so need to test further
def check_rest_actors(prev_group, curr_group, actor_timestamps, actor_id):
    log.info("started check_rest_actors")
    log.debug("prev_group: " + json.dumps(prev_group, indent=2))
    for actor in prev_group['actors']:
        if actor['actorId'] != actor_id:
            if actor_timestamps[actor['actorId']] + MARGIN_OF_ERROR >= curr_group['start']:
                curr_group['actors'].append(actor['info'])
                log.debug("added to group: " + actor['name'])
    log.info("finished check_rest_actors")
    return curr_group


# write video info and windows array contaning grouped actors w/ start and end timestamps to DynamoDB table
# writing a single prepared json object
def write_to_db(object_to_write):
    log.info("Writing to DynamoDB:")
    log.debug("object_to_write: ")
    log.debug(json.dumps(object_to_write))

    response = dynamodb_resource.Table("Videos").put_item(Item=object_to_write)
    
    log.debug("Response from DynamoDB: ")
    log.debug(json.dumps(response))
    log.info("Finished writing to DynamoDB")
    