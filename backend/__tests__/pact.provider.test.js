// __tests__/pact.provider.test.js
import { createServer } from "http"; // Add this line
import { resolve as _resolve } from "path";
import { Verifier } from "@pact-foundation/pact";
import { jest } from "@jest/globals";
import { Matchers } from "@pact-foundation/pact";

const { like, eachLike } = Matchers;

import app from "../app.js"; // Adjust the path to your Express app entry point
const server = createServer(app);
let serverInstance;

// Increase Jest timeout globally for this test suite
jest.setTimeout(30000); // 30 seconds

beforeAll(async () => {
  await new Promise((resolve) => {
    serverInstance = server.listen(4000, () => {
      console.log("Test server running on port 4000");
      resolve();
    });
  });
});

afterAll((done) => {
  serverInstance.close(() => {
    console.log("Test server stopped");
    done();
  });
});

describe("Pact Provider Verification", () => {
  it("should validate the provider against the consumer contract", async () => {
    const pactVerifier = new Verifier({
      provider: "InstaverseAPI",
      providerBaseUrl: "http://localhost:4000",
      pactUrls: [
        _resolve(process.cwd(), "pacts/WebConsumer-InstaverseAPI.json"),
      ],
      publishVerificationResult: true,
      providerVersion: "1.0.0",
      stateHandlers: {
        "user profiles exist": async () => {
          console.log("Seeding data for state: user profiles exist");
        },
        "user exists": () => ({
          user: eachLike({
            id: like("123"),
            name: like("John Doe"),
            age: like("37"),
            password: like("123"),
          }),
        }),
      },
    });

    await pactVerifier.verifyProvider();
  }, 30000); // Increase timeout for this specific test case as well
});
