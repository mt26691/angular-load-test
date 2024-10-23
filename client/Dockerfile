# Stage 1: Build the Angular application
FROM node:19 AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the Angular app code into the container
COPY . .

# Build the Angular app for production
RUN npm run build --prod

# Stage 2: Serve the Angular application using Nginx server
FROM nginx:alpine

# Copy the built Angular app from the build stage to the Nginx directory
COPY --from=build /app/dist/video-uploader-app/browser /usr/share/nginx/html

# Expose the default Nginx port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
