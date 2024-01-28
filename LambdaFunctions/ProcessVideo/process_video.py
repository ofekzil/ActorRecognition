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

rek_client = boto3.client('rekognition')
# TODO: give this lambda S3 permissions
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
        res = rek_client.get_celebrity_recognition(JobId=jobId)
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

    celebs = video['Celebrities']

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

    # grouped_actors = group_actors(actors_processed)
    # write_to_db(actors=grouped_actors, video=video_processed)


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
def group_actors(processed_video):
    return None

# write grouped results to some database, likely DynamoDB
# can have two tables (or object templates), which will be:
# - Basic info about each celeb, being Id, name, urls, and maybe an array of video Ids (foreign key to videos)
# - Info about each video, including videoId (youtube id), name, S3 info (bucket & key),
#       then also an array of json (?) objects, being of the format: {"start": 0, "end": 100, "celebs": ["id0", "id1", "id2"]}
#       Basically, each element in the array will include a starting timestamp, an end timestamp, then an array of celebs to display
#       between these two timestamps.
def write_to_db(actors, video):
    pass