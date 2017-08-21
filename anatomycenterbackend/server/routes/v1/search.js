import ContentModel from "../../models/ContentModel";
import UserModel from "../../models/UserModel";
import CommentModel from "../../models/CommentModel";
import EntertainmentModel from "../../models/EntertainmentModel";
// import Joi from "joi";


const search = async (model: { find: Function<Promise<Object[]>> }, topic: string, type: string, populates: string[] = []): Promise<Object[]> => (await ((): Promise<Object[]> => {
    let q = model.find({ $text: { $search: topic } });
    populates.forEach((item: string): void => (q = q.populate(item)));
    return q.exec();
})()).map((it: Object): Object => ({ data: it, type }));
export default [
    // All
    {
        method: "GET",
        path: "/search/{topic}",
        config: {
            description: "Do a search",
            notes: "Think of this as a data list of anything that can be indexed and searched",
            tags: ["api", "content", "dump"],
            handler: async (request: Request, reply: Response): Promise<void> => {
                const contentModel = await ContentModel.getModel();
                const userModel = await UserModel.getModel();
                const commentModel = await CommentModel.getModel();
                const entertainmentModel = await EntertainmentModel.getModel();
                try {
                    reply([
                        ...(await search(contentModel, request.params.topic, "article")),
                        ...(await search(userModel, request.params.topic, "user")),
                        ...(await search(commentModel, request.params.topic, "comment", ["postedBy"])),
                        ...(await search(entertainmentModel.Question, request.params.topic, "question", ["belongsTo"])),
                    ]);
                } catch (e) {
                    console.error(e);
                    reply(e).statusCode = 400;
                }
            },
        },
    },
];
