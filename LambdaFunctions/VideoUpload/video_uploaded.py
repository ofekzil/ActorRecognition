# !!!!!!!!!!!!ALWAYS MAKE SURE LAMBDA IS UPDTED WITH LATEST CODE BEFORE RUNNING!!!!!!!!!!!!!!!!!!


# lambda to function to trigger asynchronous call to Rekognition to process a newly uploaded video
# the trigger for this lambda is whener a new item is added to the S3 bucket
# will call start_celebrity_recognition and pass information for SNS Topic to write results to

# when uploading a video, ass a tag called videoId that is identical to the Youtube generated video Id,
# that is found in a video's url after v= 
# for example here: https://www.youtube.com/watch?v=4KD_JxmmPgg, the video Id is 4KD_JxmmPgg

# Don't forget to set environment variables in Lambda (or local)!

# modelled on AWS tutorial for using S3 to trigger lambda

import json
import urllib.parse
import boto3
import os
import logging

log = logging.getLogger()
log.setLevel(logging.INFO)

SNS_TOPIC_ARN = os.environ.get('SNS_TOPIC_ARN')
ROLE_ARN = os.environ.get('ROLE_ARN')

rekognition_client = boto3.client('rekognition')


def lambda_handler(event, context):
    log.info("Entering video_uploaded lambda for sending uploaded video in S3 to rekognition")
    log.debug("Received event: " + json.dumps(event))

    # bucket can be used for processing with rekognition
    bucket = event['Records'][0]['s3']['bucket']['name']
    log.info("Bucket = " + bucket)

    # key is the video name - can be used directly in rekognition
    key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'], encoding='utf-8')
    log.info("Key = " + key)
    
    s3_vid = {
            'S3Object': {
                'Bucket' : bucket,
                'Name' : key
            }
        }
    sns_channel = {
        'SNSTopicArn' : SNS_TOPIC_ARN,
        'RoleArn' : ROLE_ARN
    }

    try:
        response = rekognition_client.start_celebrity_recognition(Video=s3_vid, NotificationChannel=sns_channel)
        log.info("Receievd response from start_celebrity_recognition: ")
        log.info(json.dumps(response))

    except Exception as e:
        log.error('Error getting object {} from bucket {}. Make sure they exist and your bucket is in the same region as this function.'.format(key, bucket))
        log.error(e)
        raise e
    
    log.info("Exiting video_uploaded lambda for sending uploaded video in S3 to rekognition")
    
