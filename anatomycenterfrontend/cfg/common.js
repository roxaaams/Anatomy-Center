import fs from "fs";
import path from "path";
import webpack from "webpack";
import defaultSettings from "./defaults";

const appInfo = require("../package.json");

export default (config: Object): Object => {
    const _conf = config;
    _conf.plugins = _conf.plugins || [];
    _conf.plugins.push(new webpack.DefinePlugin({
        WEBPACK_BUILD: `"${defaultSettings.activeModule}"`,
        WEBPACK_ENV: `"${process.env.REACT_WEBPACK_ENV}"`,
        IS_DEV: JSON.stringify(process.env.REACT_WEBPACK_ENV.toLowerCase() === "dev"),
        IS_DIST: JSON.stringify(process.env.REACT_WEBPACK_ENV.toLowerCase() === "dist"),
        APP_VER: JSON.stringify(appInfo.version),
        "process.env.NODE_TARGET": JSON.stringify(defaultSettings.targetBuild),
        "process.env.AC_API_ADDRESS": JSON.stringify(process.env.AC_API_ADDRESS || ""),
        "process.env.AC_API_PORT": JSON.stringify(process.env.AC_API_PORT || ""),
    }));
    if (defaultSettings.targetBuild !== "electron") {
        _conf.plugins.push(new webpack.IgnorePlugin(/electron/));
    }
    // _conf.plugins.push(new webpack.IgnorePlugin(/(fs|path|crypto)/));
    _conf.module.loaders.push({
        test: /\.js$/,
        loader: "babel",
        include: [path.resolve(__dirname, `../src/sw/`)],
    });
    const swfile = path.resolve(__dirname, `../src/sw/index.js`);
    if (fs.existsSync(swfile)) {
        _conf.entry[`${defaultSettings.activeModule}.sw`] = [
            "babel-polyfill",
            "whatwg-fetch",
            swfile,
        ];
    }

    return _conf;
};
