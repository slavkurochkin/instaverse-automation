#!/bin/bash

# Start the frontend
echo "Starting frontend..."
npm --prefix ./frontend start &

# Start the backend consumer
echo "Starting backend consumer..."
node backend/consumer.js &

# Start the backend server
echo "Starting backend server..."
npm --prefix ./backend start &

# Wait for all background jobs to complete
wait
echo "All services started."
# Note: This script assumes that you have npm and node installed and available in your PATH.
# It also assumes that the frontend and backend directories are in the same directory as this script.
# Make sure to give execute permission to this script before running it:
# chmod +x start-all.sh
# You can run this script by executing:
# ./start-all.sh
# This script starts the frontend and backend services in the background.
# It uses the `&` operator to run each command in the background, allowing them to run concurrently.
# The `wait` command is used to wait for all background jobs to complete before exiting the script.
# You can modify the script to include any additional services or commands you need to start.
# Make sure to adjust the paths to the frontend and backend directories if they are different.
# You can also add error handling to ensure that each service starts successfully.
# For example, you can check the exit status of each command and handle errors accordingly.
# This script is a simple way to automate the startup process for your application.
# You can also consider using a process manager like PM2 or Docker Compose for more complex setups.
# These tools provide additional features like process monitoring, logging, and easy management of multiple services.
# If you have any questions or need further assistance, feel free to ask.
# This script is a simple way to start multiple services in a development environment.
# It is not intended for production use.
# In a production environment, you would typically use a process manager or container orchestration tool
# to manage your services.
# These tools provide better reliability, monitoring, and scaling capabilities.