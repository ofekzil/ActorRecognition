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

MARGIN_OF_ERROR = 10000

rek_client = boto3.client('rekognition')

s3_client = boto3.client('s3')

def lambda_handler(event, context):
    print("Started lambda function")
    for record in event['Records']:
        process_message(record)
    print("done")

def process_message(record):
    try:
        message = record['Sns']['Message']
        print(f"Processed message {message}")
        message_json = json.loads(message)
        jobId = message_json['JobId']
        print(jobId)
        res = rek_client.get_celebrity_recognition(JobId=jobId, SortBy='TIMESTAMP')
        res_str = json.dumps(res)
        print(res_str)
        process_video(res)
        
    except Exception as e:
        print("An error occurred")
        raise e
    
# process a result json of video analyzed by rekognition 
# create TWO json objects to write to DB, one for actors and one for the video (see comments above write_to_db)   
def process_video(video):
    # sample json template for reuslt of analyzed video
    video_processed = {
        "videoId": "",
        "name": video['Video']['S3Object']['Name'],
        "bucket": video['Video']['S3Object']['Bucket'],
        "lengthMillis": video['VideoMetadata']['DurationMillis']
    }
    video_processed['videoId'] = get_video_id(bucket=video_processed['bucket'], key=video_processed['name'])

    # template for a json object of processed actors
    actors_processed = {
        "idValue0": {
            "name": "",
                "urls": [
                    "",
                    ""
                ],
                "timestamps": [
                    {
                        "start": "",
                        "end": ""
                    },
                    {
                        "start": "",
                        "end": ""
                    }
                ]
        },
        "idValue1": {
            "name": "",
                "urls": [
                    "",
                    ""
                ],
                "timestamps": [
                    0, 10, 200
                ]
        },
    }

    # use this array for grouping actors
    # pass this array to group_actors()
    celebs = video['Celebrities']

    # unnecessary processing
    for actor in celebs:
        actorId = actor['Celebrity']['Id']
        if actorId not in actors_processed.keys():
            actors_processed[actorId] = {
                "name": actor['Celebrity']['Name'],
                "urls": actor['Celebrity']['Urls'],
                "timestamps": []
            }
        
        actors_processed[actorId]['timestamps'].append(actor['Timestamp'])

    print("Video processed:")
    print(json.dumps(video_processed))
    print("Actors processed:")
    print(json.dumps(actors_processed))

    # use celebs array from above
    # grouped_actors = group_actors(actors_processed)
    # write_to_db(actors=grouped_actors, video=video_processed)

# prepare actors as input for group_actors
def get_actors(celebs):
    actors = []
    for celeb in celebs:
        # print("celeb: " + celeb)
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
# TODO: determine whether we're able to snd the video id through Rekognition/SNS to the process_video lambda,
# or whether we need to move and call this function from process_video.py instead 
# (if that's the case we need to give that lambda S3 permissions)
def get_video_id(bucket, key):
    print(f"Getting tags for video in bucket = {bucket}, with key/name = {key}")
    tags = s3_client.get_object_tagging(Bucket=bucket, Key=key)
    print("Received tags: ")
    print(json.dumps(tags))
    video_id = tags['TagSet'][0]['Value']
    print(video_id)
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
    # actors = sorted(actors, key=lambda a: a['Timestamp'])
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
            curr_group = check_rest_actors(prev_group, curr_group, actor_timestamps, actor['info']['actorId'])
        actor_timestamps[actor['info']['actorId']] = actor['timestamp']

    windows.append(curr_group)
    return windows

# determine whether of the actors from prev_group 
# should be added to newly created curr_group
# it might be useless, so need to test further
def check_rest_actors(prev_group, curr_group, actor_timestamps, actor_id):
    print("started check_rest_actors")
    print("prev_group: " + json.dumps(prev_group, indent=2))
    for actor in prev_group['actors']:
        if actor['actorId'] != actor_id:
            if actor_timestamps[actor['actorId']] + MARGIN_OF_ERROR >= curr_group['start']:
                curr_group['actors'].append(actor['info'])
                print("added to group: " + actor['name'])
    print("finished check_rest_actors")
    return curr_group

# write grouped results to some database, likely DynamoDB
# can have two tables (or object templates), which will be:
# - Basic info about each celeb, being Id, name, urls, and maybe an array of video Ids (foreign key to videos)
# - Info about each video, including videoId (youtube id), name, S3 info (bucket & key),
#       then also an array of json (?) objects, being of the format: {"start": 0, "end": 100, "celebs": ["id0", "id1", "id2"]}
#       Basically, each element in the array will include a starting timestamp, an end timestamp, then an array of celebs to display
#       between these two timestamps.
def write_to_db(actors, video):
    pass