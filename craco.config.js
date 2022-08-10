const path = require('path');
// const { ESLINT_MODES } = require("@craco/craco");
const webpack = require("webpack");
const WebpackBar = require('webpackbar');
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin');
const darkTheme = require('@ant-design/dark-theme').default;
const CracoAntdPlugin = require('craco-antd');

module.exports = {
  eslint: {
    enable: false,
    // mode: ESLINT_MODES.file
  },
  plugins: [
    {
      plugin: CracoAntdPlugin,
      options: {
        customizeTheme: darkTheme,
      },
    },
  ],
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@styles": path.resolve(__dirname, "src/styles"),
      "@images": path.resolve(__dirname, "src/images"),
      "@image": path.resolve(__dirname, "src/images"),
      "@views": path.resolve(__dirname, "src/views"),
    },
    plugins: [
      new webpack.ProgressPlugin(),
      new WebpackBar(),
      new AntdDayjsWebpackPlugin(),
    ],
  },
  jest: {
    configure: {
      moduleNameMapper: {
        "@": "<rootDir>/src/$1",
        "@styles": "<rootDir>/src/styles/$1",
        "@images": "<rootDir>/src/images/$1",
        "@image": "<rootDir>/src/images/$1",
        "@views": "<rootDir>/src/views/$1",
      }
    }
  }
}
