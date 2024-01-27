# lambda to function to trigger asynchronous call to Rekognition to process a newly uploaded video
# the trigger for this lambda is whener a new item is added to the S3 bucket
# will call start_celebrity_recognition and pass information for SNS Topic to write results to

# Don't forget to set environment variables in Lambda (or local)!

# modelled on AWS tutorial for using S3 to trigger lambda

import json
import urllib.parse
import boto3
import os

print('Loading function')

SNS_TOPIC_ARN = os.environ.get('SNS_TOPIC_ARN')
ROLE_ARN = os.environ.get('ROLE_ARN')

s3 = boto3.client('s3')
rekognition = boto3.client('rekognition')


def lambda_handler(event, context):
    print("Received event: " + json.dumps(event, indent=2))

    # bucket can be used for processing with rekognition
    bucket = event['Records'][0]['s3']['bucket']['name']
    print("Bucket = " + bucket)
    # key is the video name - can be used directly in rekognition
    key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'], encoding='utf-8')
    print("Key = " + key)
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
        response = rekognition.start_celebrity_recognition(Video=s3_vid, NotificationChannel=sns_channel)
        print("Receievd response from start_celebrity_recognition: ")
        print(json.dumps(response))
        # response = s3.get_object(Bucket=bucket, Key=key)
        # print("Received response from S3 get_object: ")
        # print(json.dumps(response, indent=2, sort_keys=True, default=str))
        # print("CONTENT TYPE: " + response['ContentType'])
        # return response['ContentType']
    except Exception as e:
        print(e)
        print('Error getting object {} from bucket {}. Make sure they exist and your bucket is in the same region as this function.'.format(key, bucket))
        raise e
              
