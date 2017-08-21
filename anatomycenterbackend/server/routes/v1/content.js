import ContentModel from "../../models/ContentModel";
import _ from "lodash";
import Joi from "joi";

type NameType = {
    lng: String,
    name: String,
};

export default [
    // All
    {
        method: "GET",
        path: "/articles",
        config: {
            description: "Get a list of all content",
            notes: "Think of this as a data list of content",
            tags: ["api", "content", "dump"],
            handler: (request: Request, reply: Response) => {
                const response = reply;
                ContentModel.getModel().then((model: ContentModel) => {
                    model.find({}, (error: Error, data: ContentModel) => {
                        if (error) {
                            response(`${error}`).statusCode = 500;
                        } else {
                            response(data);
                        }
                    });
                });
            },
        },
    },
    {
        method: "GET",
        path: "/articles/parent/slug/{parent}",
        config: {
            description: "Receive articles which don't have parents",
            notes: "Endpoint for getting articles which don't have parents",
            tags: ["api", "articles", "get"],
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                },
            },
            handler: async (request: Request, reply: Response): Promise<void> => {
                const model = await ContentModel.getModel();
                try {
                    const parent = request.params.parent === "null" ? { _id: null } : (await model.bySlug(request.params.parent))[0];
                    reply(await model.byParent(parent._id));
                } catch (error) {
                    console.error(error);
                    reply(`${error}`).statusCode = 400;
                }
            },
        },
    },
    {
        method: "GET",
        path: "/articles/parent/slug/{parent}.ids",
        config: {
            description: "Receive articles which don't have parents",
            notes: "Endpoint for getting articles which don't have parents",
            tags: ["api", "articles", "get"],
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                },
            },
            handler: async (request: Request, reply: Response): Promise<void> => {
                const model = await ContentModel.getModel();
                try {
                    const parent = request.params.parent === "null" ? { _id: null } : (await model.bySlug(request.params.parent))[0];
                    reply((await model.byParent(parent._id)).map((it: Object): { id: string, order: ?number } => ({ id: it._id, order: it.order || 0 })));
                } catch (error) {
                    console.error(error);
                    reply(`${error}`).statusCode = 400;
                }
            },
        },
    },
    {
        method: "GET",
        path: "/articles/parent/{parent}",
        config: {
            description: "Receive articles which don't have parents",
            notes: "Endpoint for getting articles which don't have parents",
            tags: ["api", "articles", "get"],
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                },
            },
            handler: async (request: Request, reply: Response): Promise<void> => {
                const model = await ContentModel.getModel();
                try {
                    request.params.parent = request.params.parent === "null" ? null : request.params.parent;
                    reply(await model.byParent(request.params.parent));
                } catch (error) {
                    console.error(error);
                    reply(`${error}`).statusCode = 400;
                }
            },
        },
    },
    {
        method: "GET",
        path: "/articles/parent/{parent}.ids",
        config: {
            description: "Receive articles which don't have parents",
            notes: "Endpoint for getting articles which don't have parents",
            tags: ["api", "articles", "get"],
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                },
            },
            handler: async (request: Request, reply: Response): Promise<void> => {
                const model = await ContentModel.getModel();
                try {
                    request.params.parent = request.params.parent === "null" ? null : request.params.parent;
                    reply((await model.byParent(request.params.parent)).map((it: Object): { id: string, order: ?number } => ({ id: it._id, order: it.order || 0 })));
                } catch (error) {
                    console.error(error);
                    reply(`${error}`).statusCode = 400;
                }
            },
        },
    },
    {
        method: "POST",
        path: "/articles",
        config: {
            description: "Create a new article",
            notes: "Endpoint for creating a new article",
            tags: ["api", "articles", "new"],
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                },
            },
            validate: {
                payload: {
                    names: Joi.array()
                        .items(Joi.object({
                            name: Joi.string().required().description("Name"),
                            lng: Joi.string().required().description("Language to display for"),
                        }))
                        .required()
                        .description("Set of names (language based)"),

                    slugs: Joi.array()
                        .items(Joi.object({
                            slug: Joi.string().required().description("Slug"),
                            lng: Joi.string().required().description("Language to display for"),
                        }))
                        .required()
                        .description("Set of slugs (language based)"),

                    descriptions: Joi.array()
                        .items(Joi.object({
                            description: Joi.string().required().description("Description"),
                            lng: Joi.string().required().description("Language to display for"),
                        }))
                        .required()
                        .description("Set of slugs (language based)"),

                    parent: Joi.string()
                        .default(null)
                        .description("Category"),

                    media: Joi.array()
                        .items(Joi.string())
                        .default([])
                        .description("Media links (accepted: images & .stl)"),

                    order: Joi.number()
                        .default(0)
                        .description("The order in which it appears in any list"),
                },
            },
            handler: async (request: Request, reply: Response): Promise<void> => {
                const parentModel = await ContentModel.getModel();
                try {
                    if (request.payload.parent != null) {
                        const content = (await parentModel.byId(request.payload.parent))[0];
                        request.payload.parent = content;
                    }
                    const article = await parentModel.new(
                        _.pick(request.payload, Object.keys(ContentModel.schema))
                    );
                    reply(article);
                } catch (error) {
                    reply(`${error}`).statusCode = 400;
                }
            },
        },
    },
    {
        method: "POST",
        path: "/articles/swap",
        config: {
            description: "Create a new article",
            notes: "Endpoint for creating a new article",
            tags: ["api", "articles", "new"],
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                },
            },
            validate: {
                payload: {
                    id1: Joi.string()
                        .required()
                        .description("Id of first Article"),
                    id2: Joi.string()
                        .required()
                        .description("Id of first Article"),
                },
            },
            handler: async (request: Request, reply: Response): Promise<void> => {
                const contentModel = await ContentModel.getModel();
                try {
                    const article1 = (await contentModel.byId(request.payload.id1))[0];
                    const article2 = (await contentModel.byId(request.payload.id2))[0];
                    if (!article1 || !article2) {
                        throw new Error("One of the articles does not exist!");
                    }
                    article1.order = parseInt(article1.order || 0, 10);
                    article2.order = parseInt(article2.order || 0, 10);

                    article1.order = article1.order + article2.order;
                    article2.order = article1.order - article2.order;
                    article1.order = article1.order - article2.order;

                    await article1.save();
                    await article2.save();

                    reply([article1, article2].map((it: Object): Object => ({ id: it._id, order: it.order })));
                } catch (error) {
                    reply(`${error}`).statusCode = 400;
                }
            },
        },
    },
    {
        method: "GET",
        path: "/articles/{id}",
        config: {
            description: "Get an article",
            notes: "Endpoint for getting an article",
            tags: ["api", "articles", "get"],
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                },
            },
            handler: async (request: Request, reply: Response): Promise<void> => {
                const model = await ContentModel.getModel();
                try {
                    reply(await model.byId({ _id: request.params.id }));
                } catch (error) {
                    reply(`${error}`).statusCode = 400;
                }
            },
        },
    },
    {
        method: "GET",
        path: "/articles/slug/{slug}",
        config: {
            description: "Receive an article after slug",
            notes: "Endpoint for receiving an article",
            tags: ["api", "articles", "new"],
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                },
            },
            handler: async (request: Request, reply: Response): Promise<void> => {
                const model = await ContentModel.getModel();
                try {
                    reply(await model.bySlug(request.params.slug, true));
                } catch (error) {
                    reply(`${error}`).statusCode = 400;
                }
            },
        },
    },
    {
        method: "DELETE",
        path: "/articles/{id}",
        config: {
            description: "Delete one article",
            notes: "Endpoint for deleting one specific article",
            tags: ["api", "articles", "new"],
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                },
            },
            handler: async (request: Request, reply: Response): Promise<void> => {
                const model = await ContentModel.getModel();
                try {
                    await model.remove({ _id: request.params.id });
                    reply({ status: "success" });
                } catch (error) {
                    reply(`${error}`).statusCode = 400;
                }
            },
        },
    },
    {
        method: "PUT",
        path: "/articles/{id}",
        config: {
            description: "Update an article",
            notes: "Endpoint for updating an article",
            tags: ["api", "articles", "new"],
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                },
            },
            validate: {
                payload: {
                    names: Joi.array()
                        .items(Joi.object({
                            name: Joi.string().required().description("Name"),
                            lng: Joi.string().required().description("Language to display for"),
                        }))
                        .default([])
                        .description("Set of names (language based)"),

                    slugs: Joi.array()
                        .items(Joi.object({
                            slug: Joi.string().required().description("Slug"),
                            lng: Joi.string().required().description("Language to display for"),
                        }))
                        .default([])
                        .description("Set of slugs (language based)"),

                    descriptions: Joi.array()
                        .items(Joi.object({
                            description: Joi.string().required().description("Description"),
                            lng: Joi.string().required().description("Language to display for"),
                        }))
                        .default([])
                        .description("Set of slugs (language based)"),

                    parent: Joi.string()
                        .default(null)
                        .description("Parent"),

                    media: Joi.array()
                        .items(Joi.string())
                        .default([])
                        .description("Media links (accepted: images & .stl)"),

                    order: Joi.number()
                        .default(0)
                        .description("The order in which it appears in any list"),
                },
            },
            handler: async (request: Request, reply: Response): Promise<void> => {
                const model = await ContentModel.getModel();
                try {
                    const article = (await model.byId({ _id: request.params.id }))[0];
                    request.payload.names.forEach((set: NameType) => {
                        const n = article.names.find((it: NameType): bool => it && it.lng === set.lng);
                        if (n) {
                            n.name = set.name;
                        } else {
                            article.names.push(set);
                        }
                    });
                    request.payload.slugs.forEach((set: NameType) => {
                        const n = article.slugs.find((it: NameType): bool => it && it.lng === set.lng);
                        if (n) {
                            n.slug = set.slug;
                        } else {
                            article.slugs.push(set);
                        }
                    });
                    request.payload.descriptions.forEach((set: NameType) => {
                        const n = article.descriptions.find((it: NameType): bool => it && it.lng === set.lng);
                        if (n) {
                            n.description = set.description;
                        } else {
                            article.descriptions.push(set);
                        }
                    });
                    article.media = request.payload.media;
                    article.order = request.payload.order || article.order || 0;
                    if (request.payload.parent) {
                        const parent = (await model.byId(request.payload.parent))[0];
                        article.parent = parent;
                    }
                    await article.save();
                    reply(article);
                } catch (error) {
                    reply(`${error}`).statusCode = 400;
                }
            },
        },
    },
];
