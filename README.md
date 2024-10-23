# Project Name

## Table of Contents

- [Overview](#overview)
- [Architecture Overview](#architecture-overview)
- [Pre-requisites](#pre-requisites)
- [Folder Structure](#folder-structure)
- [Setup and Deployment](#setup-and-deployment)
- [Application Endpoints](#application-endpoints)
- [Running the Load Test](#running-the-load-test)
- [Running Cypress Tests](#running-cypress-tests)
- [Application Endpoints](#application-endpoints)

## Overview

This project includes a distributed system with a frontend, backend, and worker services. The stack uses Redis to manage distributed job queues, and the worker threads are set up with replicas to handle concurrent tasks efficiently. Cypress is used for automated testing to ensure application reliability.

## Architecture Overview

The architecture leverages Redis to distribute the workload between multiple worker threads, which are separate from the main API server. This approach ensures that the main API server remains responsive and is not blocked by long-running tasks or computationally intensive operations.

By using Redis and worker threads, the application can:

- **Efficiently distribute tasks**: Redis acts as a centralized queue that assigns tasks to available worker threads. This allows the system to scale horizontally as needed.
- **Prevent server blocking**: Offloading tasks to worker threads helps keep the main API server responsive, as it does not handle long-running operations directly.

Below is the architecture diagram illustrating this setup:

![Architecture Diagram](docs/architect.jpeg)

## Pre-requisites

Ensure the following tools are installed on your system before starting:

- **Docker** (Version 27 or higher)
- **Node.js** with **npm**
- **Curl** for load tests

To install Cypress dependencies, run the following command from the root of the project:

```bash
npm install
```

## Folder Structure

The project is organized as follows:

```bash
project-root/
├── api/                      # Backend code for the server and APIs
├── client/                   # Frontend code developed using Angular
├── cypress/                  # Cypress test suite for end-to-end testing
│   ├── e2e/                  # End-to-end (e2e) tests written in Cypress
│   ├── fixtures/             # Test fixture files for providing sample data
│   ├── support/              # Cypress commands and support files
├── docs/                     # Documentation resources and related images
├── docker-compose.yml        # Docker Compose configuration for managing and deploying services
├── bootstrap.sh              # Shell script for initializing and deploying services
├── load-test.sh              # Shell script to execute the load test using curl
└── load-test.mp4             # Sample MP4 video file used for load testing
```

## Setup and Deployment

Step 1: Start the Stack
To deploy the entire stack, navigate to the project root directory and execute the bootstrap script:

```bash
sh bootstrap.sh
```

This will deploy the following services using Docker Swarm or Docker Compose:

- **Stack Name** `mp4_to_gif_stack`
- **Frontend (Angular app)** at [http://localhost:42000](http://localhost:42000)
- **Backend (API)** at [http://localhost:3000](http://localhost:3000)
- **Redis** at `localhost:6379`
- **Worker Threads** running as 5 replicas, distributed via Redis Bull queue

### Step 2: Starting Development Server

If you want to start the development server without deploying on Docker Swarm, you can use the following command:

```bash
docker compose up
```

This command will spin up all the required containers in development mode using Docker Compose.

# Application Endpoints

## Frontend

Accessible at [http://localhost:42000](http://localhost:42000)

## Backend API

Accessible at [http://localhost:3000](http://localhost:3000)

### POST http://localhost:3000/v1/convert

This endpoint accepts an `MP4` file for validation and conversion to a `GIF`. The processing involves:

1. **Validation**: Ensures the uploaded file is in the proper MP4 format.
2. **Conversion**: Once validated, the backend converts the MP4 file into a GIF using an internal processing service.

**Request Structure**:

- **URL**: `http://localhost:3000/v1/convert`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Parameters**:
  - `file`: The MP4 file to be uploaded for conversion.

### GET http://localhost:3000/json/files

This endpoint provides a JSON response containing the status of processed files and a link to access each processed GIF.

**Request Structure**:

- **URL**: `http://localhost:3000/json/files`
- **Method**: `GET`

**Response**: Returns a JSON array with objects containing:

- **status**: The current status of each file (e.g., processing, completed, failed).
- **file_link**: The direct link to access the processed GIF file if the conversion is complete.

## Redis and Worker Configuration

- **Redis**: Serves as the queue manager and is accessible at `localhost:6379`. Worker threads are managed internally with a replica count of 5, distributing the load through the Redis Bull queue. This setup ensures efficient processing and distribution of conversion tasks.

## Running the Load Test

To perform a load test that sends 1000 requests in 1 minute to the endpoint `http://localhost:3000/v1/convert`, follow these steps:

1. **Ensure your server is up and running** on `localhost:3000`.
2. **Run the Load Test Script**:

```bash
sh load-test.sh
```

It will use `curl` to upload the file `load-test.mp4` 1000 times within 1 minute. Ensure that `curl` is installed on your system before executing the test to avoid any issues.

## Running Cypress Tests

To execute the Cypress tests, make sure the application stack is up and running. Then, you can open Cypress using:

```bash
npx cypress open
```

This command will launch the Cypress Test Runner, where you can select and execute tests. Alternatively, you can run tests headlessly using:

```bash
npx cypress run
```

Below is the load test diagram illustrating the system's performance under stress:

![Load Test Diagram](docs/load-test.png)
