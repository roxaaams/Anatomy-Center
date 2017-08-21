import ReverseWordModel from "../../models/ReverseWordModel";
import ContentModel from "../../models/ContentModel";
import _ from "lodash";
import Joi from "joi";

export default [

    // All
    {
        method: "GET",
        path: "/reversedwords",
        config: {
            description: "Get a list of all reversedwords data",
            notes: "Think of this as a  list of reversedwords",
            tags: ["api", "reversedwords", "dump"],
            handler: async (request: Request, reply: Response): Promise<void> => {
                const response = reply;
                const model = await ReverseWordModel.getModel();
                try {
                    const data = await model.find({});
                    response(
                        JSON.stringify(data)
                    );
                } catch (error) {
                    response(`${error}`).statusCode = 500;
                }
            },
        },
    },
    {
        method: "GET",
        path: "/reversedwords.ids",
        config: {
            description: "Get a list of all reversedwords ids",
            notes: "Think of this as a id list of reversedwords",
            tags: ["api", "reversedwords", "dump"],
            handler: async (request: Request, reply: Response): Promise<void> => {
                const response = reply;
                const model = await ReverseWordModel.getModel();
                try {
                    const data = await model.find({});
                    response(
                        JSON.stringify(data.map((it: Object): String => it._id))
                    );
                } catch (error) {
                    response(`${error}`).statusCode = 500;
                }
            },
        },
    },

    {
        method: "GET",
        path: "/articles/slug/{slug}/reversedwords",
        config: {
            description: "Receive reversedwords after the slug of the articles",
            notes: "Endpoint for receiving reversedwords",
            tags: ["api", "reversedwords", "receive"],
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                },
            },
            handler: async (request: Request, reply: Response): Promise<void> => {
                const articleModel = await ContentModel.getModel();
                const model = await ReverseWordModel.getModel();
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
        path: "/articles/slug/{slug}/reversedwords/random",
        config: {
            description: "Get one random reversedword from the database",
            notes: "Endpoint for receiving one random reversedword from the database",
            tags: ["api", "reversedwords", "receive", "random"],
            handler: async (request: Request, reply: Response): Promise => {
                const contentModel = await ContentModel.getModel();
                const model = await ReverseWordModel.getModel();
                try {
                    const content = (await contentModel.bySlug(request.params.slug))[0];
                    console.log("Finding all that belong to", content);
                    const randomReversedwords = await model.aggregate([
                        { $match: { belongsTo: content._id } },
                        { $sample: { size: 1 } },
                    ]).exec();
                    reply(randomReversedwords);
                } catch (error) {
                    console.error(error);
                    reply(`${error}`).statusCode = 400;
                }
            },
        },
    },
    {
        method: "GET",
        path: "/articles/slug/{slug}/reversedwords.ids",
        config: {
            description: "Receive a reversedword",
            notes: "Endpoint for receiving a reversedword",
            tags: ["api", "reversedwords", "receive"],
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                },
            },
            handler: async (request: Request, reply: Response): Promise<void> => {
                const articleModel = await ContentModel.getModel();
                const model = await ReverseWordModel.getModel();
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
        path: "/reversedwords",
        config: {
            description: "Create a new reversedword",
            notes: "Endpoint for creating a new reversedword (if not existing)",
            tags: ["api", "reversedwords", "new"],
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

                    keywords: Joi.array()
                        .items(Joi.object({
                            lng: Joi.string().required().description("Keyword"),
                            word: Joi.string().required().description("Language to display for"),
                        }))
                        .description("Question text"),
                },
            },
            handler: async (request: Request, reply: Response): Promise<void> => {
                const model = await ReverseWordModel.getModel();
                try {
                    reply(await model.new(
                        _.pick(request.payload, Object.keys(ReverseWordModel.schema))
                    ));
                } catch (error) {
                    reply(`${error}`).statusCode = 400;
                }
            },
        },
    },
    {
        method: "DELETE",
        path: "/reversedwords",
        config: {
            description: "Delete all reversedwords from the database",
            notes: "Endpoint for deleting all reversedwords",
            tags: ["api", "reversedwords", "delete"],
            handler: (request: Request, reply: Response) => {
                ReverseWordModel.getModel().then((model: ReverseWordModel) => {
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
        path: "/reversedwords/{id}",
        config: {
            description: "Delete reversedword from the database",
            notes: "Endpoint for deleting one specific reversedword from database",
            tags: ["api", "articles", "reversedwords", "delete", "one"],
            validate: {
                params: {
                    id: Joi
                        .string()
                        .required()
                        .description("Id of the reversedwords"),
                },
            },
            handler: (request: Request, reply: Response) => {
                ReverseWordModel.getModel().then((model: ReverseWordModel) => {
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
        path: "/reversedwords/{id}",
        config: {
            description: "Get reversedwords from the database",
            notes: "Endpoint for getting information on one specific reversedwords from questions",
            tags: ["api", "reversedwords", "get", "one"],
            validate: {
                params: {
                    id: Joi
                        .string()
                        .required()
                        .description("Id of the reversedwords"),
                },
            },
            handler: async (request: Request, reply: Response): Promise => {
                const model = await ReverseWordModel.getModel();
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
        path: "/reversedwords/{id}",
        config: {
            description: "Update a reversedword",
            notes: "Endpoint for updating a reversedword",
            tags: ["api", "reversedwords", "update"],
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
                        .description("Id of the reversedword"),
                },
                payload: {
                    keywords: Joi.array()
                        .items(Joi.object({
                            _id: Joi.string(),
                            lng: Joi.string().required().description("Word"),
                            word: Joi.string().required().description("Language to display for"),
                        }))
                        .default([])
                        .description("Keyword"),
                },
            },
            handler: async (request: Request, reply: Response): Promise<void> => {
                const model = await ReverseWordModel.getModel();
                try {
                    const reversedword = (await model.byId(request.params.id))[0];
                    if (request.payload.keywords) {
                        reversedword.keywords = request.payload.keywords;
                    }
                    await reversedword.save();
                    reply(reversedword);
                } catch (error) {
                    console.error(error);
                    reply(`${error}`).statusCode = 400;
                }
            },
        },
    },
];
