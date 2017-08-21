import BaseModel from "./BaseModel";
import UserModel from "./UserModel";
import { Schema } from "mongoose";

export default class CommentModel extends BaseModel {
    static schema = {
        belongsTo: String,
        postedBy: { type: Schema.Types.ObjectId, ref: UserModel._name },
        comment: String,
        date: Date,
        scores: [{
            user: { type: Schema.Types.ObjectId, ref: UserModel._name },
            vote: Number,
        }],
        edited: Boolean,
    }

    static indexes = [{
        comment: "text",
    }]

    static async byPost(post: String): Promise<CommentModel[]> {
        return this.find({ belongsTo: post }).exec();
    }

    static async byId(_id: string): CommentModel {
        return this.find({ _id }).exec();
    }

    static async new(initdata: Object): Promise {
        const object = (new this(initdata));

        object.date = Date.now();
        object.edited = false;

        return object.save();
    }
}
