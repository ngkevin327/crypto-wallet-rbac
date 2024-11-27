/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: ".",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  collectCoverageFrom: ["src/**/*.ts", "!src/main.ts"],
  coverageDirectory: "./coverage",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@wtp/shared/(.*)$": "<rootDir>/../../packages/shared/src/$1",
    "^@wtp/policy-engine$": "<rootDir>/../../packages/policy-engine/src/index.ts",
    "^@wtp/policy-engine/(.*)$": "<rootDir>/../../packages/policy-engine/src/$1",
  },
};
