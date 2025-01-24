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
