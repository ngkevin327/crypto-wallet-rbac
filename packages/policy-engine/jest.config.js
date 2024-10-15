/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".",
  testRegex: ".*\\.spec\\.ts$",
  collectCoverageFrom: ["src/**/*.ts", "!src/index.ts", "!src/register-handlers.ts"],
  moduleNameMapper: {
    "^@wtp/shared$": "<rootDir>/../shared/src/index.ts",
    "^@wtp/shared/(.*)$": "<rootDir>/../shared/src/$1",
  },
};
