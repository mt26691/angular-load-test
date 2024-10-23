#!/bin/bash

# Script to bootstrap Docker Swarm, build images, and deploy the stack

STACK_NAME="mp4_to_gif_stack"
COMPOSE_FILE="docker-compose.yml"

# Function to check if Docker Swarm is already initialized
function init_swarm() {
  docker info | grep -q "Swarm: active"
  if [ $? -ne 0 ]; then
    echo "Initializing Docker Swarm..."
    docker swarm init
  else
    echo "Docker Swarm is already initialized."
  fi
}

# Function to build Docker images
function build_images() {
  echo "Building Docker images using docker-compose..."
  docker compose -f $COMPOSE_FILE build
  if [ $? -ne 0 ]; then
    echo "Error: Docker images failed to build."
    exit 1
  fi
}

# Function to deploy the Docker stack
function deploy_stack() {
  echo "Deploying Docker Stack: $STACK_NAME"
  docker stack deploy -c $COMPOSE_FILE $STACK_NAME
}

# Function to clean up existing stack and volumes (optional)
function cleanup() {
  echo "Removing existing stack: $STACK_NAME"
  docker stack rm $STACK_NAME
  echo "Removing dangling images and volumes..."
  docker system prune -f
}

# Check if script was run with '--cleanup' option
if [[ $1 == "--cleanup" ]]; then
  cleanup
fi

# Initialize Docker Swarm
init_swarm

# Build Docker images
build_images

# Deploy the Docker stack
deploy_stack

echo "Bootstrap completed successfully."