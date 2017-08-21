import CommentModel from "../../models/CommentModel";
import UserModel from "../../models/UserModel";
import _ from "lodash";
import Joi from "joi";

export default [

    // All
    {
        method: "GET",
        path: "/comments",
        config: {
            description: "Get a list of all comments data",
            notes: "Think of this as a data list of comments",
            tags: ["api", "comments", "dump"],
            handler: async (request: Request, reply: Response): Promise<void> => {
                const response = reply;
                const model = await CommentModel.getModel();
                try {
                    const data = await model.find({});
                    response(data);
                } catch (error) {
                    response(`${error}`).statusCode = 500;
                }
            },
        },
    },
    {
        method: "GET",
        path: "/comments.ids",
        config: {
            description: "Get a list of all comments ids",
            notes: "Think of this as a id list of comments",
            tags: ["api", "comments", "dump"],
            handler: async (request: Request, reply: Response): Promise<void> => {
                const response = reply;
                const model = await CommentModel.getModel();
                try {
                    const data = await model.find({});
                    response(
                        data.map((it: Object): String => it._id)
                    );
                } catch (error) {
                    response(`${error}`).statusCode = 500;
                }
            },
        },
    },
    {
        method: "GET",
        path: "/topic/{topic}/comments",
        config: {
            description: "Get comments for a topic",
            notes: "Endpoint for receiving all comments which belong to the specific post",
            tags: ["api", "comments", "get"],
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                },
            },
            handler: async (request: Request, reply: Response): Promise<void> => {
                const model = await CommentModel.getModel();
                try {
                    console.log("Finding all comments that belong to", request.params.topic);
                    const data = await model.find({ belongsTo: request.params.topic }).populate("postedBy").exec();
                    console.log(data);
                    reply(data);
                } catch (error) {
                    reply(`${error}`).statusCode = 400;
                }
            },
        },
    },
    {
        method: "GET",
        path: "/users/me/comments",
        config: {
            description: "Get comments for a topic",
            notes: "Endpoint for receiving all comments which belong to the specific post",
            tags: ["api", "comments", "get"],
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                },
            },
            auth: "simple",
            handler: async (request: Request, reply: Response): Promise<void> => {
                const model = await CommentModel.getModel();
                const userModel = await UserModel.getModel();
                try {
                    const user = await userModel.findOne({ email: request.auth.credentials.email });
                    const data = await model.find({ postedBy: user }).populate("postedBy").exec();
                    reply(data);
                } catch (error) {
                    reply(`${error}`).statusCode = 400;
                }
            },
        },
    },
    {
        method: "GET",
        path: "/users/{email}/comments",
        config: {
            description: "Get comments for a topic",
            notes: "Endpoint for receiving all comments which belong to the specific post",
            tags: ["api", "comments", "get"],
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                },
            },
            handler: async (request: Request, reply: Response): Promise<void> => {
                const model = await CommentModel.getModel();
                const userModel = await UserModel.getModel();
                try {
                    const user = await userModel.findOne({ email: request.params.email });
                    const data = await model.find({ postedBy: user }).populate("postedBy").exec();
                    reply(data);
                } catch (error) {
                    reply(`${error}`).statusCode = 400;
                }
            },
        },
    },
    {
        method: "GET",
        path: "/topic/{topic}/comments.ids",
        config: {
            description: "Receive comments ids for a certain topic",
            notes: "Endpoint for receiving ids comments",
            tags: ["api", "comments", "get"],
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                },
            },
            handler: async (request: Request, reply: Response): Promise<void> => {
                const model = await CommentModel.getModel();
                try {
                    console.log("Finding all that belong to", request.params.topic);
                    const data = await model.find({ belongsTo: request.params.topic }).exec();
                    reply(data.map((it: Object): String => it._id));
                } catch (error) {
                    reply(`${error}`).statusCode = 400;
                }
            },
        },
    },

    {
        method: "POST",
        path: "/comments",
        config: {
            description: "Create a new comment",
            notes: "Endpoint for creating a new comment (if not existing)",
            tags: ["api", "comments", "new"],
            auth: "simple",
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                },
            },
            validate: {
                payload: {
                    belongsTo: Joi.string()
                        .required()
                        .description("Article ID or searchfiled"),

                    comment: Joi.string()
                                .required()
                                .description("The text of the comment"),
                },
            },
            handler: async (request: Request, reply: Response): Promise<void> => {
                const model = await CommentModel.getModel();
                const userModel = await UserModel.getModel();
                try {
                    request.payload.postedBy = await userModel.findOne({ email: request.auth.credentials.email });
                    reply(await model.new(
                        _.pick(request.payload, Object.keys(CommentModel.schema))
                    ));
                } catch (error) {
                    reply(`${error}`).statusCode = 400;
                }
            },
        },
    },
    {
        method: "DELETE",
        path: "/comments",
        config: {
            description: "Delete all comments from the database",
            notes: "Endpoint for deleting all comments",
            tags: ["api", "comments", "delete"],
            handler: (request: Request, reply: Response) => {
                CommentModel.getModel().then((model: CommentModel) => {
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
        path: "/comments/{id}",
        config: {
            description: "Delete comment from the database",
            notes: "Endpoint for deleting one specific comment from database",
            tags: ["api", "comments", "delete", "one"],
            validate: {
                params: {
                    id: Joi
                        .string()
                        .required()
                        .description("Id of the comment"),
                },
            },
            handler: (request: Request, reply: Response) => {
                CommentModel.getModel().then((model: CommentModel) => {
                    model.remove({ id: request.params.id }, (error: Error) => {
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
    {
        method: "GET",
        path: "/comments/{id}",
        config: {
            description: "Get comment from the database",
            notes: "Endpoint for getting information on one specific comment from questions",
            tags: ["api", "comments", "get", "one"],
            validate: {
                params: {
                    id: Joi
                        .string()
                        .required()
                        .description("Id of the comment"),
                },
            },
            handler: async (request: Request, reply: Response): Promise => {
                const model = await CommentModel.getModel();
                try {
                    const data = await model.byId(request.params.id);
                    reply(JSON.stringify(data));
                } catch (error) {
                    console.error(error);
                    reply(`${error}`).statusCode = 400;
                }
            },
        },
    },

    {
        method: "PUT",
        path: "/comments/{id}",
        config: {
            description: "Update a comment",
            notes: "Endpoint for updating a comment",
            tags: ["api", "comments", "put"],
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                },
            },
            validate: {
                params: {
                    id: Joi
                        .string()
                        .required()
                        .description("Id of the comment"),
                },
                payload: {
                    comment: Joi.string().description("The text of the comment"),

                    scores: Joi.array()
                        .items(Joi.object({
                            _id: Joi.string(),
                            user: Joi.string().required().description("The user who voted or not the comment"),
                            vote: Joi.number().required().description("Voted or not"),
                        }))
                        .default([])
                        .description("Vote given or taken by user"),

                    edited: Joi.boolean()
                              .default(false)
                              .description("The comment was or not edited"),
                },
            },
            handler: async (request: Request, reply: Response): Promise<void> => {
                const model = await CommentModel.getModel();
                const userModel = await UserModel.getModel();
                try {
                    request.payload.postedBy = await userModel.findOne({ email: request.auth.credentials.email });
                    const comment = (await model.byId(request.params.id))[0];

                    if (request.payload.postedBy._id !== comment.postedBy._id) {
                        throw new Error("Only owner can modify");
                    }

                    if (request.payload.comment) {
                        comment.comment = request.payload.comment;
                    }

                    if (request.payload.scores) {
                        comment.scores = request.payload.scores;
                    }

                    if (request.payload.edited === true) {
                        comment.edited = request.payload.edited;
                    }

                    await comment.save();
                    reply(comment);
                } catch (error) {
                    console.error(error);
                    reply(`${error}`).statusCode = 400;
                }
            },
        },
    },
];
