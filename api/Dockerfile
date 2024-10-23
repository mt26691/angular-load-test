FROM node:18.17.0-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the entire app code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Default command for the API service
CMD ["npm", "start"]
