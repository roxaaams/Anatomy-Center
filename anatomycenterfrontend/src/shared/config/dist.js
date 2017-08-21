import baseConfig from "./base";

const config = {
    appEnv: "dist",
    api: `http://${window.location.hostname || "localhost"}:3000/`,
};

export default Object.freeze(Object.assign({}, baseConfig, config));
