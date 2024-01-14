# test bash commands - aws CLI
# will likely not be used in project, simply for testing and playing around

# Start celebrity recognition for 66 second Big Lebowski clip
# returns a JobID for getting the values
# TODO: try out with SNS Topic 
# prev in us-west-1
aws rekognition start-celebrity-recognition --video "S3Object={Bucket=testrecognitionvideos,Name=videos/LebowskiLenin.mp4}"

# current in us-west-2
aws rekognition start-celebrity-recognition --video "S3Object={Bucket=recognitionvideos,Name=TestVideos/LebowskiLenin.mp4}" 
    \ --notification-channel SNSTopicArn="arn:aws:sns:us-west-2:759623241699:AmazonRekognitionTestTopic",RoleArn="arn:aws:iam::759623241699:role/rekognition-rol-test"

# get unfiltered recognition
aws rekognition get-celebrity-recognition --job-id 0054abfcc01168b3f59f431791c7c63ef1088771671085c1b9348278ef090e28

# filter for only timestamps, celebrity names and ids, sorting by timestamp
aws rekognition get-celebrity-recognition --job-id 0054abfcc01168b3f59f431791c7c63ef1088771671085c1b9348278ef090e28 
    \ --query 'Celebrities[*].[Timestamp, Celebrity.[Id, Name]]' --sort-by "TIMESTAMP"

# to count number of results in json, pipe using the following (works in AWS cloudshell)
| jq length


