import BaseModel from "./BaseModel";
import { Schema } from "mongoose";

export default class ContentModel extends BaseModel {
    static schema = {
        names: [{
            lng: String,
            name: String,
        }],
        slugs: [{
            lng: String,
            slug: String,
        }],
        descriptions: [{
            lng: String,
            description: String,
        }],
        parent: { type: Schema.Types.ObjectId, ref: "content" },
        media: [String],
        order: Number,
    }

    static indexes = [{
        name: "text",
        "names.name": "text",
        "descriptions.description": "text",
    }]

    static async byParent(parent: ?string): Promise<ContentModel[]> {
        return this.find({ parent }).exec();
    }

    static async bySlug(slug: string, populate: boolean = false): ContentModel {
        const query = this.find({ "slugs.slug": slug });
        if (populate) return query.populate("parent").exec();
        return query.exec();
    }

    static async byId(_id: string): ContentModel {
        return this.find({ _id }).exec();
    }

    static async new(initdata: Object): Promise {
        const object = (new this(initdata));

        return object.save();
    }
}
