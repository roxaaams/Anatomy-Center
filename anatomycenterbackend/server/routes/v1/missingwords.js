import EntertainmentModel from "../../models/EntertainmentModel";
import ContentModel from "../../models/ContentModel";
import Joi from "joi";

export default [

    // All
    {
        method: "GET",
        path: "/missingwords",
        config: {
            description: "Get a list of all missingwords data",
            notes: "Think of this as a  list of missingwords",
            tags: ["api", "missingwords", "dump"],
            handler: async (request: Request, reply: Response): Promise<void> => {
                const response = reply;
                const model = (await EntertainmentModel.getModel()).MissingWord;
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
        path: "/missingwords.ids",
        config: {
            description: "Get a list of all missingwords ids",
            notes: "Think of this as a id list of missingwords",
            tags: ["api", "missingwords", "dump"],
            handler: async (request: Request, reply: Response): Promise<void> => {
                const response = reply;
                const model = (await EntertainmentModel.getModel()).MissingWord;
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
        path: "/articles/slug/{slug}/missingwords",
        config: {
            description: "Receive missingwords after the slug of the articles",
            notes: "Endpoint for receiving missingwords",
            tags: ["api", "missingwords", "receive"],
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                },
            },
            handler: async (request: Request, reply: Response): Promise<void> => {
                const articleModel = await ContentModel.getModel();
                const model = (await EntertainmentModel.getModel()).MissingWord;
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
        path: "/articles/slug/{slug}/missingwords/random",
        config: {
            description: "Get one random missingword from the database",
            notes: "Endpoint for receiving one random missingword from the database",
            tags: ["api", "missingwords", "receive", "random"],
            handler: async (request: Request, reply: Response): Promise => {
                const contentModel = await ContentModel.getModel();
                const model = (await EntertainmentModel.getModel()).MissingWord;
                try {
                    const content = (await contentModel.bySlug(request.params.slug))[0];
                    console.log("Finding all that belong to", content);
                    const randomMissingWord = await model.aggregate([
                        { $match: { belongsTo: content._id } },
                        { $sample: { size: 1 } },
                    ]).exec();
                    reply(randomMissingWord);
                } catch (error) {
                    console.error(error);
                    reply(`${error}`).statusCode = 400;
                }
            },
        },
    },
    {
        method: "GET",
        path: "/articles/slug/{slug}/missingwords.ids",
        config: {
            description: "Receive a missingword",
            notes: "Endpoint for receiving a missingword",
            tags: ["api", "missingwords", "receive"],
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                },
            },
            handler: async (request: Request, reply: Response): Promise<void> => {
                const articleModel = await ContentModel.getModel();
                const model = (await EntertainmentModel.getModel()).MissingWord;
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
        path: "/missingwords",
        config: {
            description: "Create a new missingword",
            notes: "Endpoint for creating a new missingword (if not existing)",
            tags: ["api", "missingwords", "new"],
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

                    questions: Joi.array()
                        .items(Joi.object({
                            question: Joi.string().required().description("Text"),
                            lng: Joi.string().required().description("Language to display for"),
                        }))
                        .description("Text"),

                    answers: Joi.array()
                        .items(Joi.object()
                            .keys({
                                texts: Joi.array()
                                    .items(Joi.object({
                                        text: Joi.string().required().description("Text"),
                                        lng: Joi.string().required().description("Language to display for"),
                                    })),
                                number: Joi.number()
                                        .required()
                                        .description("The index of the missing word"),
                            })
                        )
                        .required()
                        .description("Set of answers (language based)"),
                },
            },
            handler: async (request: Request, reply: Response): Promise<void> => {
                const model = (await EntertainmentModel.getModel()).MissingWord;
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
        path: "/missingwords",
        config: {
            description: "Delete all missingwords from the database",
            notes: "Endpoint for deleting all missingwords",
            tags: ["api", "missingwords", "delete"],
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
        path: "/missingwords/{id}",
        config: {
            description: "Delete missingword from the database",
            notes: "Endpoint for deleting one specific missingword from question",
            tags: ["api", "articles", "missingwords", "delete", "one"],
            validate: {
                params: {
                    id: Joi
                        .string()
                        .required()
                        .description("Id of the missingword"),
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
        path: "/missingwords/{id}",
        config: {
            description: "Get missingword from the database",
            notes: "Endpoint for getting information on one specific missingword from database",
            tags: ["api", "missingwords", "get", "one"],
            validate: {
                params: {
                    id: Joi
                        .string()
                        .required()
                        .description("Id of the missingwords"),
                },
            },
            handler: async (request: Request, reply: Response): Promise => {
                const model = (await EntertainmentModel.getModel()).MissingWord;
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
        path: "/missingwords/{id}",
        config: {
            description: "Update a missingword",
            notes: "Endpoint for updating a missingword",
            tags: ["api", "puzzles", "update"],
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
                        .description("Id of the missingword"),
                },
                payload: {
                    questions: Joi.array()
                        .items(Joi.object({
                            _id: Joi.string(),
                            question: Joi.string().required().description("Text"),
                            lng: Joi.string().required().description("Language to display for"),
                        }))
                        .default([])
                        .description("Text"),

                    answers: Joi.array()
                        .items(Joi.object()
                            .keys({
                                _id: Joi.string(),
                                texts: Joi.array()
                                    .items(Joi.object({
                                        _id: Joi.string(),
                                        text: Joi.string().required().description("Word"),
                                        lng: Joi.string().required().description("Language to display for"),
                                    })),
                                number: Joi.number()
                                        .required()
                                        .description("The index of the missing word"),
                            })
                        )
                        .description("Set of answers (language based)"),
                },
            },
            handler: async (request: Request, reply: Response): Promise<void> => {
                const model = (await EntertainmentModel.getModel()).MissingWord;
                try {
                    const missingword = await model.findOne({ _id: request.params.id });
                    request.payload.questions.forEach((set: Object) => {
                        const n = missingword.questions.find((it: Object): bool => it && it.lng === set.lng);
                        if (n) {
                            n.question = set.question;
                        } else {
                            missingword.questions.push(set);
                        }
                    });
                    if (request.payload.answers) {
                        missingword.answers = request.payload.answers;
                    }
                    await missingword.save();
                    reply(missingword);
                } catch (error) {
                    console.error(error);
                    reply(`${error}`).statusCode = 400;
                }
            },
        },
    },
];
