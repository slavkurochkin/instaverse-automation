// hooks.js
import { beforeAll, beforeEach, after } from "dredd-hooks-template";
import fetch from "node-fetch";

let authToken = null;

// Login and get token before all tests
beforeAll(async (transactions) => {
  try {
    const response = await fetch("http://localhost:5001/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        email: "admin@gmail.com",
        password: "123",
      }),
    });

    const data = await response.json();
    authToken = data.token;
    console.log("Successfully obtained auth token");
  } catch (error) {
    console.error("Failed to get auth token:", error);
  }
});

// Add token to each request
beforeEach((transaction) => {
  // Skip adding auth header to the login endpoint itself
  if (transaction.request.uri.endsWith("/user/login")) {
    return;
  }

  if (authToken) {
    transaction.request.headers["Authorization"] = `Bearer ${authToken}`;
    console.log(`Added token to request: ${transaction.request.uri}`);
  } else {
    console.warn("No auth token available for request");
  }
});

// Log response for debugging
after((transaction) => {
  console.log(
    `${transaction.request.method} ${transaction.request.uri}: ${transaction.real.statusCode}`
  );
  if (transaction.real.statusCode === "401") {
    console.log("Response body:", transaction.real.body);
  }
});
