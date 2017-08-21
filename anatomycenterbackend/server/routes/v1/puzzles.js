import EntertainmentModel from "../../models/EntertainmentModel";
import ContentModel from "../../models/ContentModel";
import _ from "lodash";
import Joi from "joi";

export default [

    // All
    {
        method: "GET",
        path: "/puzzles",
        config: {
            description: "Get a list of all puzzles data",
            notes: "Think of this as a  list of puzzles",
            tags: ["api", "puzzles", "dump"],
            handler: async (request: Request, reply: Response): Promise<void> => {
                const response = reply;
                const model = (await EntertainmentModel.getModel()).Puzzle;
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
        path: "/puzzles.ids",
        config: {
            description: "Get a list of all puzzles ids",
            notes: "Think of this as a id list of puzzles",
            tags: ["api", "puzzles", "dump"],
            handler: async (request: Request, reply: Response): Promise<void> => {
                const response = reply;
                const model = (await EntertainmentModel.getModel()).Puzzle;
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
        path: "/articles/slug/{slug}/puzzles",
        config: {
            description: "Receive puzzles after the slug of the articles",
            notes: "Endpoint for receiving puzzles",
            tags: ["api", "puzzles", "receive"],
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                },
            },
            handler: async (request: Request, reply: Response): Promise<void> => {
                const articleModel = await ContentModel.getModel();
                const model = (await EntertainmentModel.getModel()).Puzzle;
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
        path: "/articles/slug/{slug}/puzzles/random",
        config: {
            description: "Get one random puzzle from the database",
            notes: "Endpoint for receiving one random puzzle from the database",
            tags: ["api", "puzzles", "receive", "random"],
            handler: async (request: Request, reply: Response): Promise => {
                const contentModel = await ContentModel.getModel();
                const model = (await EntertainmentModel.getModel()).Puzzle;
                try {
                    const content = (await contentModel.bySlug(request.params.slug))[0];
                    console.log("Finding all that belong to", content);
                    const randomPuzzle = await model.aggregate([
                        { $match: { belongsTo: content._id } },
                        { $sample: { size: 1 } },
                    ]).exec();
                    reply(randomPuzzle);
                } catch (error) {
                    console.error(error);
                    reply(`${error}`).statusCode = 400;
                }
            },
        },
    },
    {
        method: "GET",
        path: "/articles/slug/{slug}/puzzles.ids",
        config: {
            description: "Receive a new category",
            notes: "Endpoint for creating a new category",
            tags: ["api", "puzzles", "receive"],
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                },
            },
            handler: async (request: Request, reply: Response): Promise<void> => {
                const articleModel = await ContentModel.getModel();
                const model = (await EntertainmentModel.getModel()).Puzzle;
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
        path: "/puzzles",
        config: {
            description: "Create a new puzzle",
            notes: "Endpoint for creating a new puzzle (if not existing)",
            tags: ["api", "puzzles", "new"],
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
                        .default("//lorempixel.com/400/400")
                        .description("Media links (accepted: images)"),
                },
            },
            handler: async (request: Request, reply: Response): Promise<void> => {
                const model = (await EntertainmentModel.getModel()).Puzzle;
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
        path: "/puzzles",
        config: {
            description: "Delete all puzzles from the database",
            notes: "Endpoint for deleting all puzzles",
            tags: ["api", "puzzles", "delete"],
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
        path: "/puzzles/{id}",
        config: {
            description: "Delete puzzle from the database",
            notes: "Endpoint for deleting one specific puzzle from question",
            tags: ["api", "articles", "puzzles", "delete", "one"],
            validate: {
                params: {
                    id: Joi
                        .string()
                        .required()
                        .description("Id of the puzzle"),
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
        path: "/puzzles/{id}",
        config: {
            description: "Get puzzle from the database",
            notes: "Endpoint for getting information on one specific puzzle from questions",
            tags: ["api", "puzzles", "get", "one"],
            validate: {
                params: {
                    id: Joi
                        .string()
                        .required()
                        .description("Id of the puzzle"),
                },
            },
            handler: async (request: Request, reply: Response): Promise => {
                const model = (await EntertainmentModel.getModel()).Puzzle;
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
        path: "/puzzles/{id}",
        config: {
            description: "Update a puzzle",
            notes: "Endpoint for updating a puzzle",
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
                        .description("Id of the puzzle"),
                },
                payload: {
                    image: Joi.string()
                        .default("//lorempixel.com/400/400")
                        .description("Media links (accepted: images)"),
                },
            },
            handler: async (request: Request, reply: Response): Promise<void> => {
                const model = (await EntertainmentModel.getModel()).Puzzle;
                try {
                    const puzzle = (await model.find({ _id: request.params.id }))[0];
                    puzzle.image = request.payload.image;
                    await puzzle.save();
                    reply(puzzle);
                } catch (error) {
                    console.error(error);
                    reply(`${error}`).statusCode = 400;
                }
            },
        },
    },
];
