const path = require('path');
// const { ESLINT_MODES } = require("@craco/craco");
const webpack = require("webpack");
const WebpackBar = require('webpackbar');

module.exports = {
  eslint: {
    enable: false,
    // mode: ESLINT_MODES.file
  },
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@styles": path.resolve(__dirname, "src/styles"),
      "@images": path.resolve(__dirname, "src/images"),
      "@views": path.resolve(__dirname, "src/views"),
    },
    plugins: [
      // ...
      new webpack.ProgressPlugin(),
      new WebpackBar()
    ]
  },
  jest: {
    configure: {
      moduleNameMapper: {
        "@": "<rootDir>/src/$1",
        "@styles": "<rootDir>/src/styles/$1",
        "@images": "<rootDir>/src/images/$1",
        "@views": "<rootDir>/src/views/$1",
      }
    }
  }
}
