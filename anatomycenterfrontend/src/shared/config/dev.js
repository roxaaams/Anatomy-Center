import baseConfig from "./base";

const config = {
    appEnv: "dev",
    api: `http://${window.location.hostname}:3000`,
};

export default Object.freeze(Object.assign({}, baseConfig, config));
