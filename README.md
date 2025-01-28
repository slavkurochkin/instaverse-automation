# Instaverse Automation

Instaverse Automation is a full-stack web project using React as the frontend and Express.js as the backend. The project includes linting and code formatting tools (ESLint and Prettier), Docker support for containerization, and OpenAPI for API documentation.

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
- **Linting & Formatting:** Configured with ESLint and Prettier.
- **Docker Support:** Docker and Docker Compose configured for containerization.
- **OpenAPI:** API documentation using OpenAPI standard.

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
