import { before, beforeEach, after } from "dredd-hooks";

let authToken = "";

const credentials = {
  email: "admin@gmail.com",
  password: "123",
};

// Step 1: Set up login request with credentials
before("/user/login > POST", (transaction, done) => {
  console.log("Logging in and extracting token...");

  // Send login credentials in the request body
  transaction.request.body = JSON.stringify(credentials);
  transaction.request.headers["Content-Type"] = "application/json";

  done();
});

// Step 2: Extract token from login response
after("/user/login > POST", (transaction, done) => {
  console.log("Extracting token from login response...");

  try {
    // Parse the response body to extract the token
    const responseBody = JSON.parse(transaction.test.body);
    if (responseBody.token) {
      authToken = responseBody.token;
      console.log("Token successfully extracted:", authToken);
    } else {
      console.warn("No token found in response.");
    }
  } catch (error) {
    console.error("Error extracting token:", error);
  }

  done();
});

// Step 3: Set Authorization header for subsequent requests
beforeEach((transaction, done) => {
  if (authToken) {
    console.log(
      `Setting Authorization header for ${transaction.request.method} ${transaction.request.uri}`
    );
    // Set the Authorization header for the transaction
    transaction.request.headers["Authorization"] = `Bearer ${authToken}`;
  } else {
    console.warn("No token available, proceeding without authentication.");
  }
  done();
});
