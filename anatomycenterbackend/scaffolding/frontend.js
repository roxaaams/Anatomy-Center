import Hapi from "hapi";

export default (server: Hapi.Server): void =>
    server.route({
        method: "GET",
        path: "/{param*}",
        handler: {
            directory: {
                path: "frontend",
            },
        },
    })
