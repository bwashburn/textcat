/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "./jest.environment.js",
  //testEnvironment: "jsdom",
  transform: {
    "^.+.tsx?$": ["ts-jest", { tsconfig: "tsconfig.jest.json" }],
  },
};