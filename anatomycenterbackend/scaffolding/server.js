import Hapi from "hapi";
import Inert from "inert";
import Vision from "vision";
import Swagger from "hapi-swagger";
import pkg from "../package.json";
import AuthBearer from "hapi-auth-bearer-token";
import TokenModel from "../server/models/TokenModel";

import fs from "fs";
import path from "path";

import frontendHook from "./frontend";

process.env.PORT = process.env.PORT || 3000;
process.env.IP = process.env.IP || "0.0.0.0";

const server = new Hapi.Server();
const conf = {
    port: process.env.PORT,
    routes: { cors: true },
    host: process.env.IP,
};
const tls = fs.existsSync(path.resolve(__dirname, "../cert"))
    && fs.existsSync(path.resolve(__dirname, "../cert/client-key.pem"))
    && fs.existsSync(path.resolve(__dirname, "../cert/client-cert.pem"))
    && { tls: {
        key: fs.readFileSync(path.resolve(__dirname, "../cert/client-key.pem"), "utf-8"),
        cert: fs.readFileSync(path.resolve(__dirname, "../cert/client-cert.pem"), "utf-8"),
    } };

server.connection(conf);
if (tls) {
    server.connection({
        ...conf,
        ...tls,
    });
}

// Routes import
import generateRoutes from "../utils/routes";

export default new Promise((accept: Function, reject: Function): void =>
    Promise.all(["EntertainmentModel", "UserModel", "ContentModel"].map(
        (file: string): Promise<void> => require(`../server/models/${file}.js`).getModel() // eslint-disable-line
    )).then(() => {
        server.register([
            Inert,
            Vision,
            {
                register: Swagger,
                options: {
                    apiVersion: pkg.version,
                    pathPrefixSize: 2,
                },
            },
            AuthBearer,
        ], (err: Error): void => err && reject(err) ||
            (() => {
                server.route({
                    method: "GET",
                    path: "/explorer/{param*}",
                    handler: {
                        directory: {
                            path: "documentation",
                        },
                    },
                });

                server.auth.strategy("simple", "bearer-access-token", {
                    allowQueryToken: false,
                    validateFunc: (token: string, callback: Function) => {
                        TokenModel.getModel().then((model: TokenModel) => {
                            model.byToken(token).then((t: Array<TokenModel>) => {
                                if (t.length === 1) {
                                    t = t[0];
                                    if (t.isValid()) {
                                        callback(null, true, { token, email: t.email });
                                    } else {
                                        callback(null, false, { token });
                                    }
                                } else {
                                    callback(null, false, { token });
                                }
                            });
                        });
                    },
                });

                frontendHook(server);

                accept({
                    getServer: (): void =>
                    generateRoutes(server, path.resolve(__dirname, "../server/routes"), "/api") || server,
                    runStandalone: (): void =>
                        generateRoutes(server, path.resolve(__dirname, "../server/routes")).start((): void => console.log("Server running at:", server.info)),
                });
            })()
        );
    })
);
