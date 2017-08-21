import EntertainmentModel from "../../models/EntertainmentModel";
import ContentModel from "../../models/ContentModel";

export default [
    {
        method: "GET",
        path: "/articles/slug/{slug}/entertainment",
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
                const model = await EntertainmentModel.getModel();
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
        path: "/articles/slug/{slug}/entertainment/random",
        config: {
            description: "Get one random puzzle from the database",
            notes: "Endpoint for receiving one random puzzle from the database",
            tags: ["api", "puzzles", "receive", "random"],
            handler: async (request: Request, reply: Response): Promise => {
                const contentModel = await ContentModel.getModel();
                const model = await EntertainmentModel.getModel();
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
        path: "/articles/slug/{slug}/entertainment.ids",
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
                const model = await EntertainmentModel.getModel();
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
];
