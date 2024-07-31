/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "./jest.environment.js",
  transform: {
    "^.+.tsx?$": ["ts-jest",{}],
  },
};