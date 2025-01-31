import { writeFileSync } from "fs";
import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Express API",
      version: "1.0.0",
      description: "Automatically generated OpenAPI documentation",
    },
    servers: [{ url: "http://localhost:5001" }],
    components: {
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", example: "123" },
            name: { type: "string", example: "John Doe" },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
          },
        },
        UserInput: {
          type: "object",
          required: ["name", "email"],
          properties: {
            name: { type: "string", example: "John Doe" },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
          },
        },
      },
    },
  },
  apis: ["./routes/*.js"], // Path to your route files
};

const swaggerSpec = swaggerJsdoc(options);

// Convert JSON to YAML
import { dump } from "js-yaml";
const yamlString = dump(swaggerSpec);

// Write YAML to a file
writeFileSync("./openapi.yaml", yamlString);
console.log("✅ OpenAPI YAML file generated successfully: openapi.yaml");
