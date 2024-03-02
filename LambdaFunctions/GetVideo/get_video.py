# !!!!!!!!!!!!ALWAYS MAKE SURE LAMBDA IS UPDTED WITH LATEST CODE BEFORE RUNNING!!!!!!!!!!!!!!!!!!

# code for lambda to get video info from DynamoDB using a videoId
# triggered from frontend using an API Gateway


import json
import boto3


dynamodb_resource = boto3.resource('dynamodb')


def lambda_handler(event, context):
    print("event: ")
    print(json.dumps(event))
    video_id = event['videoId']
    print("videoId: " + video_id)
    video = dynamodb_resource.Table("Videos").get_item(Key={"videoId" : video_id})
    print("video received: ")
    print(video)
    print("video['Item']: ")
    print(video['Item'])
    print("start: " + str(video['Item']['windows'][0]['start']))
    print("end: " + str(video['Item']['windows'][0]['end']))
    return video['Item']