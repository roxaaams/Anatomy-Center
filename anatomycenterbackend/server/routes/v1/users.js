import UserModel from "../../models/UserModel";
import TokenModel from "../../models/TokenModel";
import Boom from "boom";
import _ from "lodash";
import Joi from "joi";

import requestPromise from "request-promise";

const schema = Object.keys(UserModel.schema);
const schemaWithoutPassword = _.difference(schema, ["password"]).concat(["_id"]);

export default [

    // All
    {
        method: "GET",
        path: "/users",
        config: {
            description: "Get a list of all users data",
            notes: "Think of this as a data list of users",
            tags: ["api", "users", "dump"],
            handler: (request: Request, reply: Response) => {
                const response = reply;
                UserModel.getModel().then((model: UserModel) => {
                    model.find({}, (error: Error, data: UserModel) => {
                        if (error) {
                            response(`${error}`).statusCode = 500;
                        } else {
                            response(
                                    data.map((it: UserModel): UserModel => _.pick(it, schemaWithoutPassword))
                                );
                        }
                    });
                });
            },
            plugins: {
                patronus: {
                    testValues: [{
                        __responseCode: 200,
                    }],
                },
            },
        },
    },
    {
        method: "GET",
        path: "/users/top",
        config: {
            description: "Get a list of user top after score",
            notes: "Think of this as a data user top after score",
            tags: ["api", "users", "dump"],
            handler: async (request: Request, reply: Response): Promise<void> => {
                const model = await UserModel.getModel();

                try {
                    const data = await model.find({}).sort({ score: -1 }).exec();

                    reply(data.map((it: UserModel): UserModel => _.pick(it, schemaWithoutPassword)));
                } catch (error) {
                    reply(error);
                }
            },
        },
    },
    {
        method: "GET",
        path: "/users/top/{limit}",
        config: {
            description: "Get a list of user top after score",
            notes: "Think of this as a data user top after score",
            tags: ["api", "users", "dump"],
            handler: async (request: Request, reply: Response): Promise<void> => {
                const model = await UserModel.getModel();

                try {
                    const data = await model
                        .find({})
                        .sort({ score: -1 })
                        .limit(parseInt(request.params.limit, 10))
                        .exec();

                    reply(data.map((it: UserModel): UserModel => _.pick(it, schemaWithoutPassword)));
                } catch (error) {
                    reply(error);
                }
            },
        },
    },
    {
        method: "POST",
        path: "/users",
        config: {
            description: "Create a new user",
            notes: "Endpoint for creating a new user (if not existing)",
            tags: ["api", "users", "new"],
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                },
            },
            validate: {
                payload: {
                    name: Joi.string()
                        .required()
                        .description("Name of the person"),

                    email: Joi.string()
                        .email()
                        .required()
                        .description("Email of the person"),

                    password: Joi.string()
                        .required()
                        .description("Chosen Password of the person"),
                },
            },
            handler: async (request: Request, reply: Response): Promise<void> => {
                const model = await UserModel.getModel();
                try {
                    const user = await model.new(
                        _.pick(request.payload, Object.keys(UserModel.schema))
                    );
                    reply(user);
                } catch (error) {
                    reply(`${error}`).statusCode = 400;
                }
            },
        },
    },
    {
        method: "DELETE",
        path: "/users",
        config: {
            description: "Delete all users from the database",
            notes: "Endpoint for deleting all users",
            tags: ["api", "users", "delete"],
            handler: (request: Request, reply: Response) => {
                UserModel.getModel().then((model: UserModel) => {
                    model.remove({}, (error: Error) => {
                        if (error) {
                            reply("ERROR");
                        } else {
                            reply("SUCCESS");
                        }
                    });
                });
            },
        },
    },

    // Individual
    {
        method: "DELETE",
        path: "/users/{email}",
        config: {
            description: "Delete user from the database",
            notes: "Endpoint for deleting one specific user users",
            tags: ["api", "users", "delete", "one"],
            validate: {
                params: {
                    email: Joi
                        .string()
                        .required()
                        .description("Email of the person"),
                },
            },
            handler: async (request: Request, reply: Response): Promise<void> => {
                const model = await UserModel.getModel();
                try {
                    await model.remove({ email: request.params.email });
                    reply({ status: "success" });
                } catch (error) {
                    reply(`${error}`).statusCode = 400;
                }
            },
        },
    },
    {
        method: "GET",
        path: "/users/{email}",
        config: {
            description: "Get user from the database",
            notes: "Endpoint for getting information on one specific user from users",
            tags: ["api", "users", "get", "one"],
            validate: {
                params: {
                    email: Joi
                        .string()
                        .required()
                        .description("Email of the person"),
                },
            },
            handler: async (request: Request, reply: Response): void => {
                const model = await UserModel.getModel();
                model.byEmail(request.params.email).then((data: UserModel) => {
                    if (data.length === 0) {
                        reply(Boom.notFound());
                    } else {
                        reply(data.map((it: UserModel): UserModel => _.pick(it, schemaWithoutPassword)));
                    }
                }, (error: Error) => {
                    reply("ERROR", error);
                });
            },
        },
    },
    {
        method: "GET",
        path: "/users/{email}/full",
        config: {
            description: "Get user from the database",
            notes: "Endpoint for getting information on one specific user from users",
            tags: ["api", "users", "get", "one"],
            validate: {
                params: {
                    email: Joi
                        .string()
                        .required()
                        .description("Email of the person"),
                },
            },
            handler: async (request: Request, reply: Response): void => {
                const model = await UserModel.getModel();
                try {
                    reply(model
                        .findOne({ email: request.params.email })
                        .populate({ path: "completed.completed", populate: { path: "belongsTo" } })
                        .exec()
                    );
                } catch (e) {
                    console.error(e);
                    reply(e).statusCode = 500;
                }
            },
        },
    },
    {
        method: "PUT",
        path: "/users/{email}",
        config: {
            description: "Get user from the database",
            notes: "Endpoint for getting information on one specific user users",
            tags: ["api", "users", "get", "one"],
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                },
            },
            validate: {
                payload: {
                    name: Joi
                        .string()
                        .description("Name of the person"),
                    score: Joi
                        .number()
                        .optional()
                        .description("Score of the person"),
                    hasAdminRight: Joi
                        .boolean()
                        .optional()
                        .description("The person has or not admin right"),
                },
            },
            handler: async (request: Request, reply: Response): void => {
                const model = await UserModel.getModel();
                try {
                    const data = await model.byEmail(request.params.email);
                    console.log(data);
                    if (data.length === 0) {
                        reply(Boom.notFound());
                    } else {
                        reply(data.map((it: UserModel): UserModel => {
                            schemaWithoutPassword.filter((key: string): UserModel =>
                                request.payload[key]
                            ).forEach((key: string) => {
                                it[key] = request.payload[key];
                            });
                            console.log("Item", it);
                            it.hasAdminRight = request.payload.hasAdminRight;
                            it.save();
                            return it;
                        }));
                    }
                } catch (e) {
                    console.error(e);
                    reply(e).statusCode = 500;
                }
            },
        },
    },
    {
        method: "POST",
        path: "/users/{email}/authenticate",
        config: {
            description: "Authenticate User",
            notes: "Endpoint for authenticating a user based on his password",
            tags: ["api", "users", "authenticate", "one"],
            validate: {
                params: {
                    email: Joi
                        .string()
                        .required()
                        .description("Email of the person"),
                },
                payload: {
                    password: Joi
                        .string()
                        .required()
                        .description("The password"),
                },
            },
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                },
            },
            handler: async (request: Request, reply: Response): void => {
                const model = await UserModel.getModel();

                try {
                    const data: UserModel = await model.byEmail(request.params.email);
                    if (data.length === 0) {
                        reply("Error: There is no such user").statusCode = 400;
                    } else {
                        const isAuthenticated = await data[0].authenticate(request.payload.password);
                        if (isAuthenticated) {
                            const tokenModel = await TokenModel.getModel();
                            const token = await tokenModel.new(request.params.email);
                            console.log(token, data[0]);
                            reply({ token: token.token, valid: token.valid }).statusCode = 200;
                        } else {
                            reply("Could not authenticate").statusCode = 403;
                        }
                    }
                } catch (error) {
                    reply(`${error}`).statusCode = 500;
                }
            },
        },
    },
    {
        method: "POST",
        path: "/users/{email}/authenticate/facebook",
        config: {
            description: "Authenticate User",
            notes: "Endpoint for authenticating a user based on his password",
            tags: ["api", "users", "authenticate", "one"],
            validate: {
                params: {
                    email: Joi
                        .string()
                        .required()
                        .description("Email of the person"),
                },
                payload: {
                    access_token: Joi
                        .string()
                        .required()
                        .description("The facebook access token"),
                    id: Joi
                        .string()
                        .required()
                        .description("The facebook access token"),
                },
            },
            handler: async (request: Request, reply: Response): void => {
                const model = await UserModel.getModel();
                try {
                    const response = JSON.parse(await requestPromise(`https://graph.facebook.com/me?fields=email,name,picture&access_token=${request.payload.access_token}`));
                    if (response.email === request.params.email && response.id === request.payload.id) {
                        let user;
                        try {
                            user = (await model.find({ email: response.email }).exec())[0];
                            if (!user) {
                                throw new Error("Not found!");
                            }
                        } catch (e) {
                            user = await model.new({ email: response.email, name: response.name, picture: response.picture });
                        }
                        const tokenModel = await TokenModel.getModel();
                        const token = await tokenModel.new(request.params.email);
                        reply({ token: token.token, valid: token.valid }).statusCode = 200;
                    } else {
                        reply("Could not authenticate").statusCode = 403;
                    }
                } catch (error) {
                    reply(`${error}`).statusCode = 500;
                }
            },
        },
    },
    {
        method: "GET",
        path: "/users/check.token",
        config: {
            description: "Check User Token",
            notes: "Endpoint for checking if a token is still valid",
            tags: ["api", "users", "authenticate", "check", "token"],
            auth: "simple",
            handler: async (request: Request, reply: Response): void => {
                const tokenModel = await TokenModel.getModel();
                const token = await tokenModel.byToken(request.auth.credentials.token);
                if (token.length === 1) {
                    reply({ valid: token[0].isValid(), expire: token[0].valid });
                } else {
                    reply(Boom.notFound("Token was not found"));
                }

                reply({ token: token.token, valid: token.valid }).statusCode = 200;
            },
        },
    },
    {
        method: "GET",
        path: "/users/me",
        config: {
            description: "Check User Token",
            notes: "Endpoint for checking if a token is still valid",
            tags: ["api", "users", "authenticate", "check", "token"],
            auth: "simple",
            handler: async (request: Request, reply: Response): void => {
                const userModel = await UserModel.getModel();
                const users = await userModel.byEmail(request.auth.credentials.email);

                if (users.length === 1) {
                    reply(users[0]).statusCode = 200;
                } else {
                    reply(Boom.notFound("No user found for login token."));
                }
            },
        },
    },
    {
        method: "GET",
        path: "/users/me/full",
        config: {
            description: "Check User Token",
            notes: "Endpoint for checking if a token is still valid",
            tags: ["api", "users", "authenticate", "check", "token"],
            auth: "simple",
            handler: async (request: Request, reply: Response): void => {
                try {
                    const userModel = await UserModel.getModel();
                    const user = await userModel
                        .findOne({ email: request.auth.credentials.email })
                        .populate({ path: "completed.completed", populate: { path: "belongsTo" } })
                        .exec();
                    reply(user);
                } catch (e) {
                    console.error(e);
                    reply(e).statusCode = 500;
                }
            },
        },
    },
    {
        method: "POST",
        path: "/users/me/logout",
        config: {
            description: "Remove login token",
            notes: "Endpoint for removing a login token (effectively a logout)",
            tags: ["api", "users", "authenticate", "remove", "token"],
            auth: "simple",
            handler: async (request: Request, reply: Response): void => {
                const tokenModel = await TokenModel.getModel();

                console.log(request.auth.credentials.token);

                await tokenModel.remove({ token: request.auth.credentials.token });
                reply({ status: "success" }).statusCode = 200;
            },
        },
    },
];
