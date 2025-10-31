# Instaverse Backend API

RESTful API backend for Instaverse - a photography social media platform. Built with Express.js, featuring real-time notifications, flexible database support, comprehensive testing, and production-grade monitoring.

## 🚀 Features

### Core Functionality
- **User Authentication & Authorization**
  - JWT-based authentication
  - Password hashing with bcrypt
  - Token-based session management
  - Protected routes with middleware

- **Story Management**
  - Create, read, update, and delete stories (CRUD)
  - Image upload and storage
  - Like/unlike stories
  - Comment on stories
  - Delete comments
  - Filter stories by tags
  - Get user-specific stories

- **User Profile Management**
  - View user profiles
  - Get all user profiles (admin)
  - Upload profile images (Base64)
  - Update user information

- **Real-time Notifications**
  - WebSocket server for live updates
  - RabbitMQ message queue integration
  - Offline message persistence
  - User-specific notification delivery

### Technical Features
- **Flexible Database Architecture**
  - Dual controller system (DB enabled/disabled mode)
  - MongoDB support via Mongoose
  - PostgreSQL support via pg
  - Switch databases via environment variable

- **API Documentation**
  - Interactive Swagger UI (`/api-docs`)
  - OpenAPI 3.0 specification
  - Complete endpoint documentation

- **Error Monitoring**
  - Sentry integration for error tracking
  - Performance monitoring
  - Source map support

- **Testing**
  - Unit tests with Jest
  - Contract tests with Pact
  - Provider verification
  - Mocked HTTP responses

## 🛠️ Tech Stack

### Core Framework
- **Express.js** `^4.18.1` - Web application framework
- **Node.js** - Runtime environment (ES Modules)

### Databases
- **MongoDB** `^8.0.4` via Mongoose - NoSQL database
- **PostgreSQL** `^8.13.1` via pg - Relational database

### Authentication & Security
- **jsonwebtoken** `^9.0.2` - JWT token generation/verification
- **bcryptjs** `^2.4.3` - Password hashing

### Real-time Communication
- **ws** `^8.18.0` - WebSocket server
- **amqplib** `^0.10.5` - RabbitMQ client for message queuing

### File Handling
- **multer** `^2.0.2` - File upload middleware

### API Documentation
- **swagger-jsdoc** `^6.2.8` - Generate OpenAPI specs from JSDoc
- **swagger-ui-express** `^5.0.1` - Serve Swagger UI

### Monitoring & Analytics
- **@sentry/node** `^8.51.0` - Error tracking
- **@sentry/profiling-node** `^8.51.0` - Performance profiling

### Middleware
- **body-parser** `^1.20.2` - Parse request bodies
- **cors** `^2.8.5` - Enable CORS
- **dotenv** `^16.0.3` - Environment variable management
- **dotenv-expand** `^11.0.6` - Variable expansion in .env

### Development & Testing
- **nodemon** `^3.0.1` - Auto-restart on file changes
- **Jest** `^29.7.0` - Testing framework
- **Babel** `^7.26.0` - JavaScript transpiler
- **Pact** `^13.2.0` - Consumer-driven contract testing
- **node-mocks-http** `^1.16.2` - Mock HTTP objects

## 📁 Project Structure

```
backend/
├── app.js                    # Main application entry point
├── instrument.mjs            # Sentry instrumentation
├── consumer.js               # WebSocket & RabbitMQ consumer
├── db.js                     # PostgreSQL connection pool
├── swaggerConfig.js          # Swagger/OpenAPI configuration
│
├── routes/                   # API route definitions
│   ├── users.js             # User authentication routes
│   ├── stories.js           # Story CRUD routes
│   └── profile.js           # Profile management routes
│
├── controllers/              # Business logic layer
│   ├── db/                  # Controllers with DB enabled
│   │   ├── users.js        # User operations (MongoDB/PostgreSQL)
│   │   ├── stories.js      # Story operations
│   │   └── profile.js      # Profile operations
│   └── no-db/              # Controllers with DB disabled (mock data)
│       ├── users.js
│       ├── stories.js
│       └── profile.js
│
├── models/                   # Database schemas (Mongoose)
│   ├── user.js              # User model
│   ├── storyContent.js      # Story model with comments
│   └── profile.js           # Profile model
│
├── midlewares/              # Custom middleware
│   └── authentication.js    # JWT authentication middleware
│
├── db/                      # Database configuration
│   ├── dbEnabled.js        # DB-enabled connection logic
│   └── dbDisabled.js       # DB-disabled mock logic
│
├── __tests__/               # Test suites
│   ├── unit/               # Unit tests
│   │   └── profile.test.js
│   └── contract/           # Contract tests (Pact)
│       └── pact.provider.test.js
│
├── data/                    # Mock/seed data
│   ├── users.json
│   └── stories.json
│
├── public/                  # Static files
│   └── images/             # Uploaded images
│
├── uploads/                 # User-uploaded files
│
├── Dockerfile              # Container configuration
├── Procfile                # Heroku deployment config
└── package.json            # Dependencies & scripts
```

## 🔌 API Endpoints

### Authentication (`/user`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/user/login` | User login | ❌ |
| POST | `/user/signup` | User registration | ❌ |
| DELETE | `/user/:userId` | Delete user account | ✅ |
| PATCH | `/user/:userId` | Update user profile | ✅ |

### Stories (`/stories`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/stories` | Get all stories | ❌ |
| GET | `/stories/user/:userId` | Get user's stories | ❌ |
| GET | `/stories/tags` | Get stories by tag | ❌ |
| GET | `/stories/alltags` | Get all unique tags | ❌ |
| POST | `/stories` | Create new story | ✅ |
| PATCH | `/stories/:id` | Update story | ✅ |
| DELETE | `/stories/:id` | Delete story | ✅ |
| PATCH | `/stories/:id/likeStory` | Like/unlike story | ✅ |
| POST | `/stories/:id/comment` | Add comment | ✅ |
| DELETE | `/stories/:id/comments/:commentId` | Delete comment | ✅ |
| DELETE | `/stories/user/:userId` | Delete all user stories | ✅ |
| DELETE | `/stories/comments/user/:userId` | Delete all user comments | ✅ |

### Profiles (`/profile`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/profile` | Get authenticated user profile | ✅ |
| GET | `/profile/users/:userId` | Get specific user profile | ✅ |
| GET | `/profile/users` | Get all user profiles | ✅ |
| POST | `/profile/upload-image` | Upload profile image | ✅ |

### Utility
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API welcome message |
| GET | `/test-db` | Test database connection |
| GET | `/api-docs` | Swagger UI documentation |
| GET | `/images/:filename` | Serve static images |

## 🗄️ Database Models

### User Model (Mongoose)
```javascript
{
  username: String (required),
  email: String (required),
  age: String,
  bio: String,
  favorite_style: String,
  password: String (required, hashed),
  gender: String,
  role: String (user/admin),
  avatar: String
}
```

### Story Model (Mongoose)
```javascript
{
  caption: String (required),
  username: String (required),
  userId: String (required),
  image: String (required),
  tags: [String],
  category: String,
  device: String,
  social: [String],
  likes: [String],  // Array of user IDs
  postDate: Date (default: now),
  comments: [{
    commentId: String,
    username: String,
    text: String,
    commentDate: Date
  }]
}
```

## 🔐 Authentication Flow

1. **Sign Up**: User registers with email/password → Password hashed → User created → JWT token issued
2. **Login**: Credentials verified → JWT token issued (1h expiry)
3. **Protected Routes**: Request includes `Authorization: Bearer <token>` → Middleware verifies → User ID extracted → Request proceeds

### JWT Payload
```javascript
{
  email: "user@example.com",
  id: "userId",
  iat: 1234567890,
  exp: 1234571490
}
```

## 🔄 Real-time Notifications

### Architecture
```
User Action → RabbitMQ Queue → Consumer Service → WebSocket → Client
```

### WebSocket Server (`consumer.js`)
- Runs on port **8080**
- Connects users via `ws://localhost:8080?userId=<userId>`
- Stores offline messages in memory
- Delivers pending messages on reconnection

### RabbitMQ Integration
- Queue: `notifications`
- Durable queue for reliability
- Message format:
```javascript
{
  userId: "targetUserId",
  type: "like" | "comment" | "follow",
  message: "User X liked your post",
  timestamp: Date
}
```

## 🎯 Flexible Database Support

The backend supports both **MongoDB** and **PostgreSQL** with runtime switching:

### Enable Database Mode
```bash
# .env file
DB_ENABLED=true
MONGO_URI=mongodb://localhost:27017/instaverse
# OR
# PostgreSQL connection in db.js
```

### Disable Database Mode (Mock Data)
```bash
# .env file
DB_ENABLED=false
```

The appropriate controllers are dynamically imported based on `DB_ENABLED`:
```javascript
const db = process.env.DB_ENABLED === "true"
  ? await import("./controllers/db/users.js")
  : await import("./controllers/no-db/users.js");
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB OR PostgreSQL
- RabbitMQ (for real-time notifications)

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Environment Setup:**

Create environment files based on your environment:
- `.env.local` - Local development
- `.env.development` - Development server
- `.env.production` - Production

```bash
# .env.local example
NODE_ENV=local
PORT=5001
MONGO_URI=mongodb://localhost:27017/instaverse
DB_ENABLED=true

# JWT Secret
JWT_SECRET=1234

# Sentry (optional)
SENTRY_DSN=your_sentry_dsn

# PostgreSQL (if using)
PG_USER=postgres
PG_HOST=localhost
PG_DATABASE=instaverse
PG_PASSWORD=your_password
PG_PORT=5432

# RabbitMQ
RABBITMQ_URL=amqp://localhost
```

3. **Setup Database:**

**MongoDB:**
```bash
# Ensure MongoDB is running
mongod
```

**PostgreSQL:**
```sql
CREATE DATABASE instaverse;
CREATE TABLE users (
  _id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  age VARCHAR(10),
  gender VARCHAR(50),
  bio TEXT,
  favorite_style VARCHAR(100),
  role VARCHAR(20) DEFAULT 'user',
  avatar TEXT
);
```

4. **Setup RabbitMQ:**
```bash
# Install and start RabbitMQ
brew install rabbitmq  # macOS
brew services start rabbitmq

# Or with Docker
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

5. **Start the servers:**

**API Server:**
```bash
npm start           # Production mode with auto-restart
npm run start:local # Local development mode
```

**WebSocket/Consumer Server:**
```bash
node consumer.js
```

The API will be available at:
- API: `http://localhost:5001`
- Swagger Docs: `http://localhost:5001/api-docs`
- WebSocket: `ws://localhost:8080?userId=<userId>`

## 📜 Available Scripts

### Development
- `npm start` - Start server with nodemon (auto-restart) + Sentry source maps
- `npm run start:local` - Start with `NODE_ENV=local`

### Testing
- `npm test` - Run all tests
- `npm run test:unit` - Run unit tests only
- `npm run test:contract` - Run contract tests (Pact provider verification)

### Code Quality
- `npm run lint` - Lint code with ESLint
- `npm run format` - Format code with Prettier

### Monitoring
- `npm run sentry:sourcemaps` - Upload source maps to Sentry

## 🧪 Testing

### Unit Tests
Located in `__tests__/unit/`, test individual controllers and functions:
```bash
npm run test:unit
```

### Contract Tests (Pact)
Located in `__tests__/contract/`, verify API contracts with frontend:
```bash
npm run test:contract
```

Provider verification tests ensure:
- API responses match consumer expectations
- State handlers properly seed test data
- Breaking changes are caught early

### Example Test
```javascript
describe("Pact Provider Verification", () => {
  it("should validate the provider against the consumer contract", async () => {
    const pactVerifier = new Verifier({
      provider: "InstaverseAPI",
      providerBaseUrl: "http://localhost:4000",
      publishVerificationResult: true,
      providerVersion: "1.0.12"
    });
    await pactVerifier.verifyProvider();
  });
});
```

## 📊 API Documentation (Swagger)

Interactive API documentation is available at `/api-docs`:

**Access Swagger UI:**
```
http://localhost:5001/api-docs
```

Features:
- Try out endpoints directly from the browser
- View request/response schemas
- See authentication requirements
- Example payloads for each endpoint

### Authentication in Swagger
1. Click "Authorize" button
2. Enter: `Bearer <your_jwt_token>`
3. Test protected endpoints

## 🔧 Middleware

### Authentication Middleware (`authentication.js`)
```javascript
// Extracts and verifies JWT from Authorization header
Authorization: Bearer <token>

// Adds userId to request object
req.userId = decodedToken.id
```

### Usage
```javascript
import authentication from "./midlewares/authentication.js";

router.post("/stories", authentication, createStory);
```

## 🐳 Docker Support

### Build Image
```bash
docker build -t instaverse-backend .
```

### Run Container
```bash
docker run -p 5001:5001 --env-file .env.local instaverse-backend
```

### Docker Compose
See root `docker-compose.yml` for full stack deployment.

## 📈 Error Monitoring (Sentry)

Sentry integration provides:
- Real-time error alerts
- Performance monitoring
- Request/Response tracking
- Source map support

### Configuration
1. Set `SENTRY_DSN` in environment variables
2. Import `instrument.mjs` at the top of `app.js`
3. Errors are automatically captured and reported

### Source Maps
```bash
npm run sentry:sourcemaps
```

## 🔒 Security Best Practices

- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ JWT tokens with expiration (1h)
- ✅ CORS enabled for cross-origin requests
- ✅ Environment variables for secrets
- ✅ Input validation on all endpoints
- ✅ Authentication middleware for protected routes

## 🚢 Deployment

### Heroku
```bash
# Login to Heroku
heroku login

# Create app
heroku create instaverse-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGO_URI=your_mongo_uri
heroku config:set DB_ENABLED=true

# Deploy
git push heroku main
```

The `Procfile` specifies:
```
web: node app.js
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
brew services list  # macOS
sudo systemctl status mongod  # Linux

# Verify connection string
mongodb://localhost:27017/instaverse
```

### RabbitMQ Connection Issues
```bash
# Check RabbitMQ status
brew services list rabbitmq  # macOS
sudo systemctl status rabbitmq-server  # Linux

# Access management UI
http://localhost:15672  # Default: guest/guest
```

### WebSocket Connection Issues
- Ensure consumer.js is running
- Check firewall settings for port 8080
- Verify userId is passed in query string

### JWT Token Issues
- Check token expiration (1h default)
- Verify `JWT_SECRET` matches across environments
- Ensure Bearer token format: `Bearer <token>`

## 📚 Learn More

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT.io](https://jwt.io/)
- [Swagger/OpenAPI](https://swagger.io/specification/)
- [Pact Contract Testing](https://docs.pact.io/)
- [RabbitMQ Tutorials](https://www.rabbitmq.com/getstarted.html)
- [WebSocket Protocol](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
- [Sentry Node.js Docs](https://docs.sentry.io/platforms/node/)

## 📄 License

ISC

## 👨‍💻 Author

Built with ❤️ by Slav Kurochkin

---

## 📝 Notes

- Default port: **5001**
- WebSocket port: **8080**
- JWT expires: **1 hour**
- Body size limit: **32MB** (for image uploads)
- Database can be toggled with `DB_ENABLED` environment variable
- Supports both MongoDB and PostgreSQL

