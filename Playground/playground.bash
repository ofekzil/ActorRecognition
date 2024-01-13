# test bash commands - aws CLI
# will likely not be used in project, simply for testing and playing around

# Start celebrity recognition for 66 second Big Lebowski clip
# returns a JobID for getting the values
# TODO: try out with SNS Topic 
aws rekognition start-celebrity-recognition --video "S3Object={Bucket=testrecognitionvideos,Name=videos/LebowskiLenin.mp4}"

# get unfiltered recognition
aws rekognition get-celebrity-recognition --job-id 0054abfcc01168b3f59f431791c7c63ef1088771671085c1b9348278ef090e28

# filter for only timestamps, celebrity names and ids, sorting by timestamp
aws rekognition get-celebrity-recognition --job-id 0054abfcc01168b3f59f431791c7c63ef1088771671085c1b9348278ef090e28 
    \ --query 'Celebrities[*].[Timestamp, Celebrity.[Id, Name]]' --sort-by "TIMESTAMP"

# to count number of results in json, pipe using the following (works in AWS cloudshell)
| jq length


