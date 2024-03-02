#  test the API Gateway for the lambda is working as expected

import os
import requests

API = os.environ.get("GET_VIDEO_API")
LEBOWSKI_VIDEO_ID = os.environ.get("LEBOWSKI_VIDEO_ID")

def get_video(payload):
    video = requests.post(API, json=payload)
    return video

def test_api():
    payload = {"videoId": LEBOWSKI_VIDEO_ID}
    print("Getting video info")
    video = get_video(payload)
    print("Got video info")
    print(video)
    print(video.json())

test_api()