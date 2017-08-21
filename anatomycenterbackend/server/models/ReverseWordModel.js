import BaseModel from "./BaseModel";
import ContentModel from "./ContentModel";
import { Schema } from "mongoose";

export default class ReverseWordModel extends BaseModel {
    static schema = {
        belongsTo: { type: Schema.Types.ObjectId, ref: ContentModel._name },
        keywords: [{
            lng: String,
            word: String,
        }],
    }

    static async byId(_id: String): Promise<ReverseWordModel[]> {
        return this.find({ _id }).exec();
    }

    static async byOwner(owner: ContentModel): Promise<ReverseWordModel[]> {
        return this.find({ belongsTo: owner }).exec();
    }

    static async new(initdata: Object): Promise<ReverseWordModel> {
        const object = (new this(initdata));

        return object.save();
    }

}
