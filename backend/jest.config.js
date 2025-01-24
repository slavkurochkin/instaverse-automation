export default {
  setupFiles: ["./jest.setup.js"],
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|svg)$": "<rootDir>/__mocks__/fileMock.js",
  },
  transform: {},
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
