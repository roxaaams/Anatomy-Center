const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const baseConfig = require("./base");
const defaultSettings = require("./defaults");
const args = require("minimist")(process.argv.slice(2));

// Add needed plugins here
const BowerWebpackPlugin = require("bower-webpack-plugin");

const config = Object.assign({}, baseConfig, {
    entry: {
        [`assets/${defaultSettings.activeModule}`]: [
            "babel-polyfill",
            "whatwg-fetch",
            `webpack-dev-server/client?http://${args.host || "127.0.0.1"}:${defaultSettings.port}`,
            "webpack/hot/only-dev-server",
            path.resolve(__dirname, `../src/${defaultSettings.activeModule}/index`),
        ],
        ...(
            defaultSettings.targetBuild &&
            fs.existsSync(path.resolve(__dirname, `../src/${defaultSettings.activeModule}/${defaultSettings.targetBuild}.js`)) &&
            {
                [`assets/${defaultSettings.activeModule}.${process.env.NODE_TARGET}`]: [
                    "babel-polyfill",
                    "whatwg-fetch",
                    `webpack-dev-server/client?http://${args.host || "127.0.0.1"}:${defaultSettings.port}`,
                    "webpack/hot/only-dev-server",
                    path.resolve(__dirname, `../src/${defaultSettings.activeModule}/${process.env.NODE_TARGET}`),
                ],
            }
        ),
    },
    cache: true,
    devtool: "eval-source-map",
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
        new BowerWebpackPlugin({
            searchResolveModulesDirectories: false,
        }),
    ],
    module: defaultSettings.getDefaultModules(),
});

// Add needed loaders to the defaults here
config.module.loaders.push({
    test: /\.(js|jsx)$/,
    loader: "react-hot!babel-loader",
    include: [].concat(
        config.additionalPaths,
        [path.resolve(__dirname, `../src/shared`)],
        [path.resolve(__dirname, `../src/${defaultSettings.activeModule}`)],
    ),
});

module.exports = config;
