# Instaverse Automation

Instaverse Automation is a full-stack web project using React as the frontend, Express.js as the backend and PostgreSQL as Database. The project includes linting and code formatting tools (ESLint and Prettier), Docker support for containerization, and OpenAPI for API documentation.

- [Application Demo](#application-demo)
- [Project Structure](#project-structure)
- [Features](#features)
- [Getting Started](#getting-started)
- [Database Setup](#database-setup)
- [Notifications System](#notification-system-overview)
- [API Documentation](#api-documentation)
- [SonatQube Configuration](##sonarqube-configuration)
- [Testing](#testing)
  - [E2E Testing with Playwright](#e2e-testing-with-playwright)
  - [Contract Testing with Pact](#contract-testing)
  - [Unit Testing and Coverage with Jest](#unit-testing-and-coverage)
- [Pre-Commit Hooks Setup](#pre-commit-hooks-setup)
- [Monitoring and Observability](#monitoring-and-observability-with-sentry)
- [Contributing](#contributing)

## Application Demo

Login, sorting and commenting

![Application Demo](/assets/instaverse-1.gif)

Dashboard

![Application Demo](/assets/instaverse-2.gif)

Adding new story and deleting it

![Application Demo](/assets/instaverse-3.gif)

## Project Structure

The project has the following structure:

```
instaverse-automation/
├── frontend/          # React frontend
├── backend/           # Express backend
├── docker-compose.yml # Docker setup
├── package.json       # Root package file with scripts for both services
└── README.md          # Project documentation
```

## Features

- **Frontend:** Built with React.
- **Backend:** Built with Express.js.
- **Database:** PostgreSQL.
- **Linting & Formatting:** Configured with ESLint and Prettier.
- **Security Scanner:** SonarQube
- **Docker Support:** Docker and Docker Compose configured for containerization.
- **OpenAPI:** API documentation using OpenAPI standard.
- **Contract Testing:** Pactflow
- **Unit Testing:** Jest

## Getting Started

### Prerequisites

- Node.js (>=14.x)
- npm (>=7.x)
- Docker and Docker Compose

### Installation

Install dependencies for the entire project (root, frontend, and backend):

```bash
npm run install:all
```

### Running the Project

Start both frontend and backend servers concurrently:

```bash
npm start
```

Run frontend and backend separately if needed:

```bash
npm run start:frontend
npm run start:backend
```

# Database Setup

## Overview

This document provides the schema and setup instructions for the database used in the project. It covers table structures, relationships, and key queries related to managing users, posts, and associated data.

## Database Schema

![Database schema](/assets/db-diagram.png)

### **Users Table**

Stores user information, including total posts.

```sql
CREATE TABLE users (
    _id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    age TIMESTAMP,
    gender VARCHAR(10),
    bio TEXT,
    favorite_style VARCHAR(50),
    total_posts INT DEFAULT 0 CHECK (total_posts >= 0),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);
```

### **Posts Table**

Stores posts made by users.

```sql
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    caption TEXT NOT NULL,
    category TEXT NOT NULL,
    device TEXT NOT NULL,
    username TEXT NOT NULL,
    user_id INT NOT NULL,
    image TEXT NOT NULL,  -- Storing base64 string
    post_date TIMESTAMP NOT NULL,
	FOREIGN KEY (user_id) REFERENCES users(_id) ON DELETE CASCADE
);
```

### **Post Tags Table**

Stores tags associated with posts.

```sql
CREATE TABLE post_tags (
    id SERIAL PRIMARY KEY,
    post_id INT NOT NULL,
    tag TEXT NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);
```

### **Post Social Table**

Stores social platforms where a post is shared.

```sql
CREATE TABLE post_social (
    id SERIAL PRIMARY KEY,
    post_id INT NOT NULL,
    platform TEXT NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);
```

### **Post Likes Table**

```sql
CREATE TABLE post_likes (
    id SERIAL PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);
```

### **Comments Table**

Stores comments on posts.

```sql
CREATE TABLE post_comments (
    id SERIAL PRIMARY KEY,
    post_id INT NOT NULL,
    comment_id TEXT NOT NULL,
    text TEXT NOT NULL,
    user_id INT NOT NULL,
    username TEXT NOT NULL,
    comment_date TIMESTAMP NOT NULL,
    seen_by_story_owner BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);
```

## Setup Instructions

1. Install PostgreSQL and create a database.
2. Run the schema creation queries.
3. Ensure proper indexing for faster queries.
4. Use transactions when inserting multiple related records.
5. Add `.env.local` in backend project
6. Set `DB_ENABLED = true`, if `DB_ENABLED` set to `false` it will use mocked db (json)
7. Start backend `npm run start:local`

## Future Enhancements

- Add soft deletes for posts and comments.
- Implement indexing for faster lookups on `user_id` and `post_id`.
- Introduce triggers to update `total_posts` automatically.

---

# Notification System Overview

This project provides a WebSocket-based notification system integrated with RabbitMQ to deliver real-time notifications to users. The system is designed to handle both online and offline users by storing notifications for offline users and sending them when they reconnect.

![RabbitMQ](/assets/rabbitmq.png)

![Notifications Demo](/assets/notifications.gif)

## Features

- **Real-time notifications via WebSocket**: Clients (users) can connect to a WebSocket server to receive notifications.
- **Offline message storage**: If a user is offline when a message is sent, the notification will be stored and delivered once the user reconnects.
- **RabbitMQ integration**: Notifications are received from a RabbitMQ queue and delivered to the correct user through the WebSocket connection.

## Architecture

1. **WebSocket Server** (`ws`):

   - A WebSocket server listens for incoming WebSocket connections from clients.
   - Each client must include a `userId` as a query parameter when connecting. This ensures the server can associate messages with the correct user.
   - When a client reconnects, it will receive any pending messages that were stored while it was offline. If no pending messages exist, the client receives a `user_back_online` notification.

2. **Pending Messages Storage**:

   - The server stores messages for offline users in a `pendingMessages` map, where the key is the `userId` and the value is an array of messages.
   - When a client connects, the system checks if there are any pending messages. If so, they are sent immediately upon connection.

3. **RabbitMQ Consumer**:
   - The system listens to a RabbitMQ queue (`notifications`) for new messages.
   - Upon receiving a message, the system checks if the corresponding user is online via WebSocket. If the user is online, the message is sent immediately. If the user is offline, the message is stored for future delivery when the user reconnects.

## How it Works

1. **Client Connection**:

   - A client (user) connects to the WebSocket server with the URL:
     ```
     ws://localhost:8080?userId=<userId>
     ```
   - The server checks if the `userId` is provided and establishes a WebSocket connection.

2. **Sending Notifications**:

   - Notifications are sent to users via WebSocket when new messages are received from RabbitMQ.
   - If the user is online, the message is immediately sent to the WebSocket client.
   - If the user is offline, the message is stored in the `pendingMessages` map associated with the `userId`.

3. **Offline Message Handling**:
   - When an offline user reconnects, the WebSocket server checks if there are any pending messages for that user.
   - If pending messages exist, they are sent to the user upon connection.
   - If no pending messages exist, the server sends a `user_back_online` notification.

## Setup and Running the Project

1. **Install Dependencies**:

   - Install the required dependencies for the project:
     ```bash
     npm install
     ```

2. **Start RabbitMQ**:

   - Ensure that RabbitMQ is running on `localhost:5672`. You can use Docker to run RabbitMQ:
     ```bash
     docker run -d -p 5672:5672 -p 15672:15672 --name rabbitmq rabbitmq:management
     ```

3. **Start the WebSocket Server**:

   - Run the WebSocket server:
     ```bash
     node backend/consumer.js
     ```

4. **Consume Messages from RabbitMQ**:

   - The system will automatically start consuming messages from the `notifications` queue in RabbitMQ. Ensure that your RabbitMQ server has a queue named `notifications`.

5. **Client Example**:
   - You can connect a WebSocket client using the URL:
     ```
     ws://localhost:8080?userId=<userId>
     ```
     to test the notification system.

## Example Notification Flow

1. **User 1 sends a notification**:
   - A notification is published to the RabbitMQ `notifications` queue with a payload:
     ```json
     {
       "type": "LIKE",
       "postId": "1",
       "userId": 2,
       "likedBy": 7
     }
     ```
2. **User 2 is offline**:

   - The notification for User 2 is stored in the `pendingMessages` map because User 2 is not connected at the time the message is sent.

3. **User 2 reconnects**:

   - Upon reconnecting, the WebSocket server sends any pending messages to User 2.

4. **User 1 receives a message**:
   - If User 1 is connected, they receive the notification in real-time.

## Notes

- **WebSocket Reconnection**: The WebSocket client should handle reconnections to ensure that users who disconnect and reconnect can still receive their notifications.
- **Message Persistence**: The messages are stored in memory. If the server is restarted, the pending messages are lost. Consider integrating a persistent storage solution for message durability if needed.

## Troubleshooting

- **WebSocket Not Connecting**: Ensure that the `userId` query parameter is properly set when connecting to the WebSocket server.
- **Messages Not Delivered**: Check if RabbitMQ is running and the queue is properly set up. Verify that the server is consuming messages from the correct queue.

```
node backend/consumer.js
```

### Docker Setup

Build and start the entire project using Docker Compose:

```bash
docker-compose up --build
```

## API Documentation

OpenAPI documentation is available. Ensure the backend server is running and visit:

```
http://localhost:<backend-port>/api-docs
```

![Documentation Demo](/assets/api-docs.gif)

## SonarQube Configuration

This project includes a SonarQube setup that can be run locally for code quality analysis.

![Documentation Demo](/assets/sonarq.gif)

### Running SonarQube Locally

1. Ensure you have Docker installed and running on your machine.
2. Use the following command to start SonarQube:
   ```bash
   docker-compose up -d
   ```
3. Access SonarQube UI at `http://localhost:9000`.
4. Default credentials:
   - Username: `admin`
   - Password: `admin`

### Running Analysis

Run the following command to trigger a code analysis using SonarScanner:

```bash
sonar-scanner
```

Ensure your `sonar-project.properties` file is correctly configured in the root directory.

### Linting and Formatting

Run ESLint on both frontend and backend:

```bash
npm run lint
```

Format code using Prettier:

```bash
npm run format
```

# Testing

## Test Data Seeding

![Test Data Seeding](/assets/test-data-seeding.gif)

## E2E Testing with Playwright

Runs the end-to-end tests.

```
npx playwright test
```

Starts the interactive UI mode.

```
npx playwright test --ui
```

Runs the tests only on Desktop Chrome.

```
npx playwright test --project=chromium
```

Runs the tests in a specific file.

```
npx playwright test example
```

Runs the tests in debug mode.

```
npx playwright test --debug
```

Auto generate tests with Codegen.

```
npx playwright codegen
```

## Contract Testing

Contract testing is used to validate the interactions between the frontend and backend components of Instaverse. This ensures that both components adhere to the agreed-upon API contracts, reducing integration issues.

![Contract Testing](/assets/contract-testing.gif)

### Frontend

The frontend uses `jest` for contract testing and includes scripts for running tests and publishing Pacts to a Pact Broker.

#### Scripts

- **Run Contract Tests**:

  ```bash
  npm run test:contract
  ```

  Executes contract tests defined in `pact.test.js`.

- **Publish Pacts**:
  ```bash
  npm run publish:pact
  ```
  Publishes the generated Pacts to the configured Pact Broker.

#### Prerequisites

- Set the following environment variables:
  - `PACT_BROKER_BASE_URL`: The base URL of your Pact Broker.
  - `PACT_BROKER_TOKEN`: Token for authentication with the Pact Broker.

### Backend

The backend uses `jest` with experimental VM modules for contract testing. Scripts are provided for running tests with and without additional experimental settings.

#### Scripts

- **Run All Tests**:

  ```bash
  npm test
  ```

  Executes all tests, including unit and integration tests.

- **Run Contract Tests**:

- **Run Contract Tests with Experimental Flags**:
  ```bash
  npm run test:contract
  ```
  Runs contract tests with additional experimental VM module settings.

### Benefits

- Ensures compatibility between frontend and backend.
- Catches integration issues early.
- Maintains API stability.

## Unit Testing and Coverage

Unit tests are written using Jest to ensure code quality and correctness.\
To run unit tests, use the following command:

```bash
npm run test:unit
```

To generate a test coverage report, run:

```bash
npm run test:coverage
```

This will create a detailed coverage report in the `coverage` directory. Open `coverage/lcov-report/index.html` in your browser to view the report.

![Jest Unit Testing](/assets/test-coverage.gif)

## Pre-Commit Hooks Setup

This project is configured with a pre-commit hook to streamline the testing process in a monorepo environment. The hook automatically determines which tests to run based on the changes staged for commit, ensuring efficiency and code quality.

### How It Works

- **Frontend changes**: Runs frontend unit tests using Jest.
- **Backend changes**: Runs backend unit tests using Jest.
- **Changes in both**: Runs all tests for both frontend and backend.

### Configuration

1. **Pre-commit Hook**
   The pre-commit hook is defined using [Husky](https://typicode.github.io/husky/). The hook is configured to execute a custom script, `scripts/precommit.js`, which dynamically determines the scope of the tests to run based on the files that have been staged.

   To ensure the hook is installed and works correctly:

   ```bash
   npx husky install
   ```

2. **Scripts**
   Relevant scripts are defined in `package.json` to run the tests:

   ```json
   "scripts": {
     "test:frontend": "node --experimental-vm-modules node_modules/jest/.bin/jest --config frontend/jest.config.js",
     "test:unit:backend": "node --experimental-vm-modules node_modules/jest/.bin/jest --config backend/jest.config.js"
   }
   ```

3. **Precommit.js Script**
   The `scripts/precommit.js` file dynamically determines which tests to run based on the staged files:

   ```javascript
   import { execSync } from "child_process";

   const stagedFiles = execSync("git diff --cached --name-only", {
     encoding: "utf-8",
   });

   const runFrontendTests = stagedFiles.includes("frontend/");
   const runBackendTests = stagedFiles.includes("backend/");

   try {
     if (runFrontendTests && runBackendTests) {
       execSync("npm run test:frontend && npm run test:unit:backend", {
         stdio: "inherit",
       });
     } else if (runFrontendTests) {
       execSync("npm run test:frontend", { stdio: "inherit" });
     } else if (runBackendTests) {
       execSync("npm run test:unit:backend", { stdio: "inherit" });
     } else {
       console.log("No relevant changes for tests. Skipping...");
     }
   } catch (error) {
     console.error("Tests failed:", error.message);
     process.exit(1);
   }
   ```

### Running the Hook

To test the pre-commit hook manually:

```bash
git add .
git commit -m "Test pre-commit hook"
```

### Notes

- Make sure `precommit.js` is executable and defined in `package.json`.
- Extend or customize the script to include additional test types or workflows as needed.

By automating test execution with pre-commit hooks, you can enforce quality standards and improve developer productivity across the monorepo.

## Monitoring and Observability with Sentry

We use [Sentry](https://sentry.io/) for real-time error tracking and monitoring across both the frontend (React) and backend (Express) of our application. Sentry helps us capture, report, and track errors, providing insights into issues as they occur in a production environment.

### React Frontend

The React frontend is configured to send error events to Sentry whenever JavaScript errors, unhandled promise rejections, or other critical issues occur. Sentry automatically captures unhandled exceptions and provides detailed error reports, including stack traces and context for debugging.

#### Setup

1. **Install Sentry SDK**:
   In the frontend directory, install the Sentry SDK:

   ```bash
   npm install @sentry/react
   ```

2. **Initialize Sentry**:
   In your `index.js` or `app.js` (or equivalent entry point), initialize Sentry:

   ```javascript
   import * as Sentry from "@sentry/react";
   Sentry.init({ dsn: "YOUR_SENTRY_DSN" });
   ```

3. **Error Reporting**:
   Sentry will automatically capture errors in React components. You can also manually capture errors or messages:
   ```javascript
   Sentry.captureException(new Error("Custom Error"));
   ```

### Express Backend

The Express backend is configured to send uncaught errors and performance metrics to Sentry for monitoring. This allows you to capture errors at the application level and get insights into the performance of your backend APIs.

#### Setup

1. **Install Sentry SDK**:
   In the backend directory, install the Sentry SDK:

   ```bash
   npm install @sentry/node
   ```

2. **Initialize Sentry**:
   In your main `server.js` (or equivalent entry point), initialize Sentry:

   ```javascript
   const Sentry = require("@sentry/node");
   Sentry.init({ dsn: "YOUR_SENTRY_DSN" });
   ```

3. **Capture Errors**:
   Sentry automatically captures uncaught exceptions, unhandled promise rejections, and any errors thrown in routes. You can manually capture errors:

   ```javascript
   app.get("/some-endpoint", (req, res) => {
     throw new Error("Custom Error");
   });
   ```

4. **Error Handling Middleware**:
   Ensure that Sentry's error handling middleware is placed after all route handlers:
   ```javascript
   app.use(Sentry.Handlers.errorHandler());
   ```

### Monitoring Features

- **Error Alerts**: Sentry notifies you in real-time about new errors in both the frontend and backend.
- **Performance Monitoring**: Sentry tracks API response times and helps identify performance bottlenecks.
- **Contextual Data**: Every error is enriched with additional context such as browser information, HTTP request data, stack traces, and user context, which makes debugging easier.

### Accessing the Sentry Dashboard

1. Go to the [Sentry Dashboard](https://sentry.io/) and log in to your account.
2. You'll be able to view all captured issues, trace performance, and monitor error trends over time.

### Local Development

- Ensure you are using the production build for both the frontend and backend to mimic the production environment locally.
- If running locally in development mode, Sentry may behave differently; refer to the [Sentry documentation](https://docs.sentry.io/platforms/javascript/) for further setup options.

### More Information

For more details on configuring and customizing Sentry, refer to the official [Sentry documentation](https://docs.sentry.io/).

![Monitoring](/assets/sentry.io.gif)

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature-name`).
3. Commit changes (`git commit -m 'Add feature'`).
4. Push the branch (`git push origin feature-name`).
5. Open a Pull Request.

## License

This project is licensed under the MIT License.

---

**Happy Coding! 🚀**
