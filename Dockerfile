# Use the latest LTS version of Node.js as the base image
FROM node:lts

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install the project dependencies
RUN npm install

# Copy the server files to the container
COPY . .

# Expose the server port
EXPOSE 3000

# Run the server and log output to the terminal
CMD ["npm", "start"]
