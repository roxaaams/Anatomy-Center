import EntertainmentModel from "../../models/EntertainmentModel";
import ContentModel from "../../models/ContentModel";
import Joi from "joi";

export default [

    // All
    {
        method: "GET",
        path: "/matchedobjects",
        config: {
            description: "Get a list of all matchedobjects data",
            notes: "Think of this as a  list of matchedobjects",
            tags: ["api", "matchedobjects", "dump"],
            handler: async (request: Request, reply: Response): Promise<void> => {
                const response = reply;
                const model = (await EntertainmentModel.getModel()).MatchedObject;
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
        path: "/matchedobjects.ids",
        config: {
            description: "Get a list of all matchedobjects ids",
            notes: "Think of this as a id list of matchedobjects",
            tags: ["api", "matchedobjects", "dump"],
            handler: async (request: Request, reply: Response): Promise<void> => {
                const response = reply;
                const model = (await EntertainmentModel.getModel()).MatchedObject;
                try {
                    const data = await model.find({});
                    response(data.map((it: Object): String => it._id));
                } catch (error) {
                    response(`${error}`).statusCode = 500;
                }
            },
        },
    },

    {
        method: "GET",
        path: "/articles/slug/{slug}/matchedobjects",
        config: {
            description: "Receive matchedobjects after the slug of the articles",
            notes: "Endpoint for receiving matchedobjects",
            tags: ["api", "matchedobjects", "receive"],
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                },
            },
            handler: async (request: Request, reply: Response): Promise<void> => {
                const articleModel = await ContentModel.getModel();
                const model = (await EntertainmentModel.getModel()).MatchedObject;
                try {
                    const article = (await articleModel.bySlug(request.params.slug))[0];
                    console.log("Finding all that belong to", article);
                    const data = await model.find({ belongsTo: article._id });
                    reply(data);
                } catch (error) {
                    reply(`${error}`).statusCode = 400;
                }
            },
        },
    },
    {
        method: "GET",
        path: "/articles/slug/{slug}/matchedobjects/random",
        config: {
            description: "Get one random matchedobject from the database",
            notes: "Endpoint for receiving one random matchedobjec from the database",
            tags: ["api", "matchedobjects", "receive", "random"],
            handler: async (request: Request, reply: Response): Promise => {
                const contentModel = await ContentModel.getModel();
                const model = (await EntertainmentModel.getModel()).MatchedObject;
                try {
                    const content = (await contentModel.bySlug(request.params.slug))[0];
                    console.log("Finding all that belong to", content);
                    const randomMatchedObject = await model.aggregate([
                        { $match: { belongsTo: content._id } },
                        { $sample: { size: 1 } },
                    ]).exec();
                    reply(randomMatchedObject);
                } catch (error) {
                    console.error(error);
                    reply(`${error}`).statusCode = 400;
                }
            },
        },
    },
    {
        method: "GET",
        path: "/articles/slug/{slug}/matchedobjects.ids",
        config: {
            description: "Receive a matchedobject",
            notes: "Endpoint for receiving a matchedobject",
            tags: ["api", "matchedobjects", "receive"],
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                },
            },
            handler: async (request: Request, reply: Response): Promise<void> => {
                const articleModel = await ContentModel.getModel();
                const model = (await EntertainmentModel.getModel()).MatchedObject;
                try {
                    const article = (await articleModel.bySlug(request.params.slug))[0];
                    console.log("Finding all that belong to", article);
                    const data = await model.find({ belongsTo: article._id });
                    reply(data.map((it: Object): String => it._id));
                } catch (error) {
                    reply(`${error}`).statusCode = 400;
                }
            },
        },
    },

    {
        method: "POST",
        path: "/matchedobjects",
        config: {
            description: "Create a new matchedobject",
            notes: "Endpoint for creating a new matchedobject (if not existing)",
            tags: ["api", "matchedobjects", "new"],
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                },
            },
            validate: {
                payload: {
                    belongsTo: Joi.string()
                        .required()
                        .description("Article ID"),

                    image: Joi.string()
                        .required()
                        .description("Media links (accepted: images)"),

                    answers: Joi.array()
                        .items(Joi.object()
                            .keys({
                                words: Joi.array()
                                    .items(Joi.object({
                                        word: Joi.string().required().description("Text"),
                                        lng: Joi.string().required().description("Language to display for"),
                                    })),

                                correct: Joi.number()
                                    .required()
                                    .description("The correct number on the picture"),
                            })
                        )
                        .required()
                        .description("Set of answers (language based)"),
                },
            },
            handler: async (request: Request, reply: Response): Promise<void> => {
                const model = (await EntertainmentModel.getModel()).MatchedObject;
                try {
                    reply(await model.new(request.payload));
                } catch (error) {
                    reply(`${error}`).statusCode = 400;
                }
            },
        },
    },
    {
        method: "DELETE",
        path: "/matchedobjects",
        config: {
            description: "Delete all matchedobjects from the database",
            notes: "Endpoint for deleting all matchedobjects",
            tags: ["api", "matchedobjects", "delete"],
            handler: (request: Request, reply: Response) => {
                EntertainmentModel.getModel().then((model: EntertainmentModel) => {
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
        path: "/matchedobjects/{id}",
        config: {
            description: "Delete matchedobject from the database",
            notes: "Endpoint for deleting one specific matchedobject from question",
            tags: ["api", "articles", "matchedobjects", "delete", "one"],
            validate: {
                params: {
                    id: Joi
                        .string()
                        .required()
                        .description("Id of the matchedobject"),
                },
            },
            handler: (request: Request, reply: Response) => {
                EntertainmentModel.getModel().then((model: EntertainmentModel) => {
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
        path: "/matchedobjects/{id}",
        config: {
            description: "Get matchedobject from the database",
            notes: "Endpoint for getting information on one specific matchedobject from database",
            tags: ["api", "matchedobjects", "get", "one"],
            validate: {
                params: {
                    id: Joi
                        .string()
                        .required()
                        .description("Id of the matchedobject"),
                },
            },
            handler: async (request: Request, reply: Response): Promise => {
                const model = (await EntertainmentModel.getModel()).MatchedObject;
                try {
                    const data = await model.findOne({ _id: request.params.id });
                    reply(data);
                } catch (error) {
                    console.error(error);
                    reply(`${error}`).statusCode = 400;
                }
            },
        },
    },

    {
        method: "PUT",
        path: "/matchedobjects/{id}",
        config: {
            description: "Update a matchedobject",
            notes: "Endpoint for updating a matchedobject",
            tags: ["api", "matchedobjects", "update"],
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
                        .description("Id of the matchedobject"),
                },
                payload: {
                    image: Joi.string()
                        .default("//lorempixel.com/400/400")
                        .description("Media links (accepted: images & .stl)"),

                    answers: Joi.array()
                        .items(Joi.object()
                            .keys({
                                _id: Joi.string(),
                                words: Joi.array()
                                    .items(Joi.object({
                                        _id: Joi.string(),
                                        word: Joi.string().required().description("Word"),
                                        lng: Joi.string().required().description("Language to display for"),
                                    })),
                                correct: Joi.number()
                                    .required()
                                    .description("The correct number on the picture"),
                            })
                        )
                        .default([])
                        .description("Set of answers (language based)"),
                },
            },
            handler: async (request: Request, reply: Response): Promise<void> => {
                const model = (await EntertainmentModel.getModel()).MatchedObject;
                try {
                    const matchedword = await model.findOne({ _id: request.params.id });
                    if (request.payload.answers) {
                        matchedword.answers = request.payload.answers;
                    }
                    if (request.payload.image) {
                        matchedword.image = request.payload.image;
                    }
                    await matchedword.save();
                    reply(matchedword);
                } catch (error) {
                    console.error(error);
                    reply(`${error}`).statusCode = 400;
                }
            },
        },
    },
];
