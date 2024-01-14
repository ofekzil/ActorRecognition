# test API and code
# will likely use Python for project (easiest and most convenient)


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
        
    except Exception as e:
        print("An error occurred")
        raise e