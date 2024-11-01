import exp from "constants";
import swaggerJsDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Instaverse API Documentation",
      version: "1.0.0",
      description: "API documentation for Instaverse app",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: "Profile",
        description: "Operations related to user profiles",
      },
      {
        name: "Stories",
        description: "Operations related to user stories",
      },
    ],
    servers: [
      {
        url: "http://localhost:5001", // Your server URL
        description: "Local server",
      },
    ],
  },
  apis: ["./routes/*.js"], // Path to the API docs
};

const swaggerSpec = swaggerJsDoc(options);

export default swaggerSpec;
