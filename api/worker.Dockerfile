# Dockerfile for the worker service

# Use the official Node.js image with Alpine Linux
FROM node:18.17.0-alpine

# Install ffmpeg and ffprobe
RUN apk update && apk add --no-cache ffmpeg

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the entire app code
COPY . .

# Default command for the worker service
CMD ["npm", "run", "worker"]