const path = require("path");
const defaultSettings = require("./defaults");

// Additional npm or bower modules to include in builds
// Add all foreign plugins you may need into this array
// @example:
// let npmBase = path.join(__dirname, "../node_modules");
// let additionalPaths = [ path.join(npmBase, "react-bootstrap") ];
const additionalPaths = [];

module.exports = {
    additionalPaths,
    port: defaultSettings.port,
    devtool: "eval",
    output: {
        path: path.resolve(__dirname, "../dist"),
        filename: `[name].js`,
        publicPath: defaultSettings.publicPath,
    },
    devServer: {
        contentBase: path.resolve(__dirname, `../src/${defaultSettings.activeModule}`),
        historyApiFallback: true,
        hot: true,
        port: defaultSettings.port,
        publicPath: defaultSettings.publicPath,
        noInfo: false,
    },
    resolve: {
        modulesDirectories: [path.resolve(__dirname, "../node_modules")],
        extensions: ["", ".js", ".jsx", ".sass", ".css", ".scss"],
        alias: {
            config: `${defaultSettings.srcPath}/shared/config/${process.env.REACT_WEBPACK_ENV}`,

            configDir: `${defaultSettings.srcPath}/${defaultSettings.activeModule}/config`,
            components: `${defaultSettings.srcPath}/${defaultSettings.activeModule}/components`,
            routes: `${defaultSettings.srcPath}/${defaultSettings.activeModule}/components/routes`,
            styles: `${defaultSettings.srcPath}/${defaultSettings.activeModule}/styles`,
            images: `${defaultSettings.srcPath}/${defaultSettings.activeModule}/images`,

            shared: `${defaultSettings.srcPath}/shared`,
            "shared-styles": `${defaultSettings.srcPath}/shared/styles`,
            "shared-helpers": `${defaultSettings.srcPath}/shared/helpers`,
            "shared-images": `${defaultSettings.srcPath}/shared/images`,

            baseComponent: `${defaultSettings.srcPath}/shared/baseComponent.js`,

            api: `${defaultSettings.srcPath}/shared/api`,
            state: `${defaultSettings.srcPath}/shared/state`,
            translation: `${defaultSettings.srcPath}/shared/translation`,
        },
    },
    resolveLoader: {
        modulesDirectories: [path.resolve(__dirname, "../node_modules")],
    },
    module: {},
    sassLoader: {
        data: `@import "${path.resolve(__dirname, "../src/shared/styles/variables.sass")}";`,
    },
    target: ["web", "electron"].indexOf(process.env.NODE_TARGET) >= 0 ? process.env.NODE_TARGET : "web",
    debug: process.env.NODE_ENV,
};
