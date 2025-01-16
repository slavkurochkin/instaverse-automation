# Instaverse Automation

Instaverse Automation is a full-stack web project using React as the frontend and Express.js as the backend. The project includes linting and code formatting tools (ESLint and Prettier), Docker support for containerization, and OpenAPI for API documentation.

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

### Linting and Formatting

Run ESLint on both frontend and backend:

```bash
npm run lint
```

Format code using Prettier:

```bash
npm run format
```

## API Documentation

OpenAPI documentation is available. Ensure the backend server is running and visit:

```
http://localhost:<backend-port>/api-docs
```

## Application Demo

Login, sorting and commenting

![Application Demo](/assets/instaverse-1.gif)

Dashboard

![Application Demo](/assets/instaverse-2.gif)

Adding new story and deleting it

![Application Demo](/assets/instaverse-3.gif)

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
