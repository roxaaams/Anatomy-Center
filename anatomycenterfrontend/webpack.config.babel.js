const path = require("path");
const fs = require("fs");
const args = require("minimist")(process.argv.slice(2));

// List of allowed environments
const allowedEnvs = ["dev", "dist", "test"];
const allowedSources = fs.readdirSync(path.resolve(__dirname, "./src"));

if (allowedSources.indexOf("shared") >= 0) {
    allowedSources.splice(allowedSources.indexOf("shared"), 1);
}

// Set the correct environment
let env;
if (args._.length > 0 && args._.indexOf("start") !== -1) {
    env = "test";
} else if (args.env) {
    env = args.env;
} else if (process.env.WEBPACK_ENV) {
    env = process.env.WEBPACK_ENV;
} else {
    env = "dev";
}

let src;
if (args.src) {
    src = args.src;
} else if (process.env.WEBPACK_SRC) {
    src = process.env.WEBPACK_SRC;
} else {
    src = "app";
}
/**
 * Build the webpack configuration
 * @param {String} wantedEnv The wanted environment
 * @param {String} wantedSrc The wanted source
 * @return {Object} Webpack config
 */
function buildConfig(wantedEnv: string, wantedSrc: string): Object {
    const isValidEnv = wantedEnv && wantedEnv.length > 0 && allowedEnvs.indexOf(wantedEnv) !== -1;
    const validEnv = isValidEnv ? wantedEnv : "dev";

    const isValidSrc = wantedSrc && wantedSrc.length > 0 && allowedSources.indexOf(wantedSrc) !== -1;
    const validSrc = isValidSrc ? wantedSrc : "app";

    process.env.REACT_WEBPACK_ENV = validEnv;
    process.env.REACT_WEBPACK_SRC = validSrc;

    const config = require(path.resolve(__dirname, `cfg/${validEnv}`)); // eslint-disable-line
    const shared = require(path.resolve(__dirname, `cfg/common`)); // eslint-disable-line
    // console.log(shared(config));
    return shared(config);
}

module.exports = buildConfig(env, src);
