import { execSync } from "child_process";

// Get the list of staged files
const stagedFiles = execSync("git diff --cached --name-only", {
  encoding: "utf-8",
});

if (!stagedFiles) {
  console.log("No files staged for commit.");
  process.exit(0);
}

// Determine what to test
const runFrontendTests = stagedFiles.includes("frontend/");
const runBackendTests = stagedFiles.includes("backend/");

// Run tests based on changes
try {
  if (runFrontendTests && runBackendTests) {
    console.log("Running all tests...");
    execSync("npm run test:unit:frontend && npm run test:unit:backend", {
      stdio: "inherit",
    });
  } else if (runFrontendTests) {
    console.log("Running frontend tests...");
    execSync("npm run test:unit:frontend", { stdio: "inherit" });
  } else if (runBackendTests) {
    console.log("Running backend tests...");
    execSync("npm run test:unit:backend", { stdio: "inherit" });
  } else {
    console.log("No relevant changes for tests. Skipping...");
  }
} catch (error) {
  console.error("Tests failed:", error.message);
  process.exit(1);
}
