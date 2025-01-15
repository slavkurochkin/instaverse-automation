export default {
  transform: {}, // No transform needed for native ESM
  testEnvironment: "node",
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.mjs$": "$1",
  },
};
