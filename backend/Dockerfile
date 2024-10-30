# Use the official Node.js image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend code
COPY . .

# Expose the backend port (e.g., 5001)
EXPOSE 5001

# Start the backend server
CMD ["node", "app.js"]
