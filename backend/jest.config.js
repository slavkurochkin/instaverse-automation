export default {
  setupFiles: ["./jest.setup.js"],
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1", // Fix imports with file extensions
  },
  moduleFileExtensions: ["js", "jsx"],
  testEnvironment: "node",
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["html", "text"],
  collectCoverageFrom: [
    "controllers/*.{js,jsx}",
    "routes/*.{js,jsx}",
    "midlewares/*.{js,jsx}",
    "models/*.{js,jsx}",
    "!src/**/*.test.{js,jsx}",
    "!src/index.js",
    "!src/**/styles.js",
  ],
};
