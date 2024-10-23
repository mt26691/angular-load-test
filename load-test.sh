#!/bin/bash

# Number of requests per minute
requests_per_minute=1000
# Number of parallel requests to execute per batch
parallel_requests=50
# Time interval between each batch in seconds
interval=3

# Path to your video file
video_file="load-test.mp4"

# Calculate total number of iterations per minute based on parallelism
iterations=$(( requests_per_minute / parallel_requests ))

# Record the start time
start_time=$(date +%s)

# Function to perform a single batch of parallel requests
function send_requests {
    seq $parallel_requests | xargs -n 1 -P $parallel_requests curl -X POST \
    -F "file=@${video_file}" "http://localhost:3000/v1/convert"
}

# Loop to send requests and stop after 1 minute
for i in $(seq 1 $iterations); do
    # Check if 1 minute has passed
    current_time=$(date +%s)
    elapsed_time=$(( current_time - start_time ))

    if [ $elapsed_time -ge 60 ]; then
        echo "Time limit of 1 minute reached. Exiting."
        exit 0
    fi

    send_requests

    # Sleep to control the rate of requests
    sleep $interval
done
