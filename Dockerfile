FROM node:latest

# Copy all application files into the container
COPY . /home/app

# Set the working directory to /home/app
WORKDIR /home/app

# Install the app dependencies
RUN npm install

# Expose the required port (optional, for the app to listen on)
EXPOSE 9000

# Set the default command to start the app
CMD ["node", "index.js"]
