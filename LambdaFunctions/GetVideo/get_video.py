# !!!!!!!!!!!!ALWAYS MAKE SURE LAMBDA IS UPDTED WITH LATEST CODE BEFORE RUNNING!!!!!!!!!!!!!!!!!!

# code for lambda to get video info from DynamoDB using a videoId
# triggered from frontend using an API Gateway


import json
import boto3
import logging


log = logging.getLogger()
log.setLevel(logging.INFO)

dynamodb_resource = boto3.resource('dynamodb')


def lambda_handler(event, context):
    log.info("Entering get_video lambda for getting video from DynamoDB")
    log.debug("event: ")
    log.debug(json.dumps(event))

    video_id = event['videoId']
    log.info("videoId: " + video_id)

    video = dynamodb_resource.Table("Videos").get_item(Key={"videoId" : video_id})
    log.info("video received: ")
    log.info(video)
    
    log.debug("video['Item']: ")
    log.debug(video['Item'])
    log.debug("start: " + str(video['Item']['windows'][0]['start']))
    log.debug("end: " + str(video['Item']['windows'][0]['end']))
    log.info("Exiting get_video lambda for getting video from DynamoDB")
    return video['Item']