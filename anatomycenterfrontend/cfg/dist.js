const path = require("path");
const fs = require("fs");
const webpack = require("webpack");

const baseConfig = require("./base");
const defaultSettings = require("./defaults");

const CopyWebpackPlugin = require("copy-webpack-plugin");
const JsDocPlugin = require("jsdoc-webpack-plugin");

const srcPath = path.join(__dirname, "/../src");

// Add needed plugins here
const BowerWebpackPlugin = require("bower-webpack-plugin");
const config = Object.assign({}, baseConfig, {
    entry: {
        [`assets/${defaultSettings.activeModule}`]: [
            "babel-polyfill",
            "whatwg-fetch",
            path.resolve(__dirname, `../src/${defaultSettings.activeModule}/index`),
        ],
        ...(
            defaultSettings.targetBuild &&
            fs.existsSync(path.resolve(__dirname, `../src/${defaultSettings.activeModule}/${defaultSettings.targetBuild}.js`)) &&
            {
                [`assets/${defaultSettings.activeModule}.${defaultSettings.targetBuild}`]: [
                    "babel-polyfill",
                    "whatwg-fetch",
                    path.resolve(__dirname, `../src/${defaultSettings.activeModule}/${defaultSettings.targetBuild}`),
                ],
            }
        ),
    },
    cache: false,
    devtool: "sourcemap",
    plugins: ((process.env.NODE_ENV || "production") === "production" ? [
        ...(process.env.WEBPACK_NO_DOCS !== "true" && [
            new JsDocPlugin({
                conf: path.resolve(__dirname, "../jsdoc.conf"),
            }),
        ]),
        new webpack.optimize.DedupePlugin(),
        new webpack.DefinePlugin({
            "process.env.NODE_ENV": "\"production\"",
        }),
        new BowerWebpackPlugin({
            searchResolveModulesDirectories: false,
        }),
        new webpack.optimize.UglifyJsPlugin(),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.AggressiveMergingPlugin(),
        new webpack.NoErrorsPlugin(),
    ] : []).concat([
        new CopyWebpackPlugin([{
            from: path.resolve(__dirname, `../src/${defaultSettings.activeModule}/index.html`),
            to: `${defaultSettings.activeModule !== "app" ? `${defaultSettings.activeModule}/` : ""}index.html`,
        }].concat(fs.existsSync(path.resolve(__dirname, `../src/${defaultSettings.acrtiveModule}/asssets`)) ? [{
            from: path.resolve(__dirname, `../src/${defaultSettings.acrtiveModule}/asssets`),
            to: `${defaultSettings.activeModule !== "app" ? `${defaultSettings.activeModule}/` : ""}assets`,
        }] : [])),
    ]),
    module: defaultSettings.getDefaultModules(),
});

// Add needed loaders to the defaults here
config.module.loaders.push({
    test: /\.(js|jsx)$/,
    loader: "babel",
    exclude: [path.resolve(__dirname, `../src/sw`)],
    include: [].concat(
        config.additionalPaths,
        [path.resolve(__dirname, `../src/shared`)],
        [path.resolve(__dirname, `../src/${defaultSettings.activeModule}`)],
    ),
});
config.output.path = path.resolve(__dirname, `../dist/${process.env.NODE_TARGET || "web"}`);
config.module.preLoaders.push({
    test: /\.(js|jsx)$/,
    include: srcPath,
    loader: "eslint-loader",
});
console.log(config.entry);

module.exports = config;
