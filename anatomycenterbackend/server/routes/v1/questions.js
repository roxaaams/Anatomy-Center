import EntertainmentModel from "../../models/EntertainmentModel";
import ContentModel from "../../models/ContentModel";
import UserModel from "../../models/UserModel";
import Joi from "joi";

export default [

    // All
    {
        method: "GET",
        path: "/questions",
        config: {
            description: "Get a list of all questions data",
            notes: "Think of this as a data list of questions",
            tags: ["api", "questions", "dump"],
            handler: async (request: Request, reply: Response): Promise<void> => {
                const response = reply;
                const model = (await EntertainmentModel.getModel()).Question;
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
        path: "/questions.ids",
        config: {
            description: "Get a list of all questions data",
            notes: "Think of this as a data list of questions",
            tags: ["api", "questions", "dump"],
            handler: async (request: Request, reply: Response): Promise<void> => {
                const response = reply;
                const model = (await EntertainmentModel.getModel()).Question;
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
        method: "POST",
        path: "/questions/{id}/answer",
        config: {
            description: "Get a list of all questions data",
            notes: "Think of this as a data list of questions",
            tags: ["api", "questions", "dump"],
            validate: {
                payload: {
                    selected: Joi.number()
                        .required()
                        .description("Disease ID"),
                },
            },
            auth: "simple",
            handler: async (request: Request, reply: Response): Promise<void> => {
                const response = reply;
                const model = (await EntertainmentModel.getModel()).Question;
                const userModel = await UserModel.getModel();
                try {
                    const data = await model.findOne({ _id: request.params.id });
                    const user = await userModel
                        .findOne({ email: request.auth.credentials.email })
                        .populate("completed")
                        .exec();
                    const oldScore = user.score || 0;
                    console.log(data, user);
                    if (data.answers[request.payload.selected].correct) {
                        user.score += data.score || 5;
                        user.completed.push({ completed: data, at: Date.now() });
                        user.save();
                    }
                    console.log(user);
                    response({
                        oldScore,
                        newScore: user.score,
                        completed: user.completed,
                    });
                } catch (error) {
                    console.error(error);
                    response(`${error}`).statusCode = 500;
                }
            },
        },
    },
    {
        method: "GET",
        path: "/articles/slug/{slug}/questions",
        config: {
            description: "Get questions after the slug of the article",
            notes: "Endpoint for receiving questions after the slug of the article",
            tags: ["api", "questions", "get"],
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                },
            },
            handler: async (request: Request, reply: Response): Promise<void> => {
                const diseaseModel = await ContentModel.getModel();
                const model = (await EntertainmentModel.getModel()).Question;
                try {
                    const disease = (await diseaseModel.bySlug(request.params.slug))[0];
                    console.log("Finding all that belong to", disease);
                    const data = await model.find({ belongsTo: disease._id });
                    reply(data);
                } catch (error) {
                    reply(`${error}`).statusCode = 400;
                }
            },
        },
    },
    {
        method: "GET",
        path: "/articles/slug/{slug}/questions/random",
        config: {
            description: "Get one random question from the database",
            notes: "Endpoint for receiving one random question from the database",
            tags: ["api", "questions", "receive", "random"],
            handler: async (request: Request, reply: Response): Promise => {
                const contentModel = await ContentModel.getModel();
                const model = (await EntertainmentModel.getModel()).Question;
                try {
                    const content = (await contentModel.bySlug(request.params.slug))[0];
                    console.log("Finding all that belong to", content);
                    const randomQuestion = await model.aggregate([
                        { $match: { belongsTo: content._id } },
                        { $sample: { size: 1 } },
                    ]).exec();
                    reply(randomQuestion);
                } catch (error) {
                    console.error(error);
                    reply(`${error}`).statusCode = 400;
                }
            },
        },
    },
    {
        method: "GET",
        path: "/articles/{id}/questions",
        config: {
            description: "Get all the questions with articleID",
            notes: "Endpoint for receiving all the questions whoch belong to the article with the specific id",
            tags: ["api", "questions", "get"],
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                },
            },
            handler: async (request: Request, reply: Response): Promise<void> => {
                const model = (await EntertainmentModel.getModel()).Question;
                try {
                    const data = await model.find({ belongsTo: request.params.id });
                    reply(data);
                } catch (error) {
                    reply(`${error}`).statusCode = 400;
                }
            },
        },
    },
    {
        method: "GET",
        path: "/articles/{id}/questions/random",
        config: {
            description: "Get one random question from the database",
            notes: "Endpoint for receiving one random question from the database",
            tags: ["api", "questions", "receive", "random"],
            handler: async (request: Request, reply: Response): Promise => {
                const contentModel = await ContentModel.getModel();
                const model = (await EntertainmentModel.getModel()).Question;
                try {
                    const content = (await contentModel.byId(request.params.id))[0];
                    const randomQuestion = await model.aggregate([
                        { $match: { belongsTo: content._id } },
                        { $sample: { size: 1 } },
                    ]).exec();
                    reply(randomQuestion);
                } catch (error) {
                    console.error(error);
                    reply(`${error}`).statusCode = 400;
                }
            },
        },
    },
    {
        method: "GET",
        path: "/articles/slug/{slug}/questions.ids",
        config: {
            description: "Receive ids questions after the slug of the content",
            notes: "Endpoint for receiving ids questions after the slug of the content",
            tags: ["api", "questions", "get"],
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                },
            },
            handler: async (request: Request, reply: Response): Promise<void> => {
                const contentModel = await ContentModel.getModel();
                const model = (await EntertainmentModel.getModel()).Question;
                try {
                    const disease = (await contentModel.bySlug(request.params.slug))[0];
                    console.log("Finding all that belong to", disease);
                    const data = await model.find({ belongsTo: disease._id });
                    reply(data.map((it: Object): String => it._id));
                } catch (error) {
                    reply(`${error}`).statusCode = 400;
                }
            },
        },
    },

    {
        method: "POST",
        path: "/questions",
        config: {
            description: "Create a new question",
            notes: "Endpoint for creating a new question (if not existing)",
            tags: ["api", "questions", "new"],
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                },
            },
            validate: {
                payload: {
                    belongsTo: Joi.string()
                        .required()
                        .description("Disease ID"),

                    questions: Joi.array()
                        .items(Joi.object({
                            question: Joi.string().required().description("Question"),
                            lng: Joi.string().required().description("Language to display for"),
                        }))
                        .description("Question text"),

                    answers: Joi.array()
                        .items(Joi.object()
                            .keys({
                                correct: Joi.boolean(),
                                texts: Joi.array()
                                    .items(Joi.object({
                                        text: Joi.string().required().description("Text"),
                                        lng: Joi.string().required().description("Language to display for"),
                                    })),
                            })
                        )
                        .required()
                        .description("Set of answers (language based)"),

                    score: Joi.number()
                        .default(5)
                        .description("The number to add to one's score"),
                },
            },
            handler: async (request: Request, reply: Response): Promise<void> => {
                const model = await EntertainmentModel.getModel();
                try {
                    reply(model.new(request.payload, model.Question));
                } catch (error) {
                    reply(`${error}`).statusCode = 400;
                }
            },
        },
    },
    {
        method: "DELETE",
        path: "/questions",
        config: {
            description: "Delete all questions from the database",
            notes: "Endpoint for deleting all questions",
            tags: ["api", "questions", "delete"],
            handler: async (request: Request, reply: Response): Promise<void> => {
                const model = (await EntertainmentModel.getModel()).Question;
                try {
                    model.remove({});
                    reply("Success");
                } catch (e) {
                    console.error(e);
                    reply(e).statusCode = 500;
                }
            },
        },
    },

    // Individual
    {
        method: "DELETE",
        path: "/questions/{id}",
        config: {
            description: "Delete question from the database",
            notes: "Endpoint for deleting one specific question from database",
            tags: ["api", "articles", "delete", "one"],
            validate: {
                params: {
                    id: Joi
                        .string()
                        .required()
                        .description("Id of the disease"),
                },
            },
            handler: async (request: Request, reply: Response): Promise<void> => {
                const model = (await EntertainmentModel.getModel()).Question;
                try {
                    model.remove({ id: request.params.id });
                    reply("Success");
                } catch (e) {
                    console.error(e);
                    reply(e).statusCode = 500;
                }
            },
        },
    },
    {
        method: "GET",
        path: "/questions/{id}",
        config: {
            description: "Get question from the database",
            notes: "Endpoint for getting information on one specific question from questions",
            tags: ["api", "questions", "get", "one"],
            validate: {
                params: {
                    id: Joi
                        .string()
                        .required()
                        .description("Id of the question"),
                },
            },
            handler: async (request: Request, reply: Response): Promise => {
                const model = (await EntertainmentModel.getModel()).Question;
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
        path: "/questions/{id}",
        config: {
            description: "Create a new question",
            notes: "Endpoint for creating a new question (if not existing)",
            tags: ["api", "questions", "new"],
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
                        .description("Id of the question"),
                },
                payload: {
                    questions: Joi.array()
                        .items(Joi.object({
                            _id: Joi.string(),
                            question: Joi.string().required().description("Question"),
                            lng: Joi.string().required().description("Language to display for"),
                        }))
                        .default([])
                        .description("Question text"),

                    answers: Joi.array()
                        .items(Joi.object()
                            .keys({
                                _id: Joi.string(),
                                correct: Joi.boolean(),
                                texts: Joi.array()
                                    .items(Joi.object({
                                        _id: Joi.string(),
                                        text: Joi.string().required().description("Text"),
                                        lng: Joi.string().required().description("Language to display for"),
                                    })),
                            })
                        )
                        .description("Set of answers (language based)"),
                },
            },
            handler: async (request: Request, reply: Response): Promise<void> => {
                const model = (await EntertainmentModel.getModel()).Question;
                try {
                    const question = (await model.find({ _id: request.params.id }))[0];
                    request.payload.questions.forEach((set: Object) => {
                        const n = question.questions.find((it: Object): bool => it && it.lng === set.lng);
                        if (n) {
                            n.name = set.name;
                        } else {
                            question.questions.push(set);
                        }
                    });
                    if (request.payload.answers) {
                        question.answers = request.payload.answers;
                    }
                    await question.save();
                    reply(question);
                } catch (error) {
                    console.error(error);
                    reply(`${error}`).statusCode = 400;
                }
            },
        },
    },
];
