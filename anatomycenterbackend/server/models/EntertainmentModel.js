import BaseModel from "./BaseModel";
import ContentModel from "./ContentModel";
import { Schema } from "mongoose";

export default class EntertainmentModel extends BaseModel {
    static schema = {
        belongsTo: { type: Schema.Types.ObjectId, ref: ContentModel._name },
        score: Number,
    }

    static discriminate = [
        {
            name: "Question",
            schema: {
                questions: [{
                    lng: String,
                    question: String,
                }],
                answers: [{
                    texts: [{ lng: String, text: String }],
                    correct: Boolean,
                }],
            },
            indexes: [{
                "questions.question": "text",
            }],
        },
        {
            name: "MatchedObject",
            schema: {
                image: String,
                answers: [{
                    words: [{ lng: String, word: String }],
                    correct: Number,
                }],
            },
        },
        {
            name: "MissingWord",
            schema: {
                questions: [{
                    lng: String,
                    question: String,
                }],
                answers: [{
                    texts: [{ lng: String, text: String }],
                    number: Number,
                }],
            },
        },
        {
            name: "Puzzle",
            schema: {
                image: String,
                size: Number,
            },
        },
    ]

    static async new(initdata: Object, constructor: Function = this): Promise {
        const object = (new constructor(initdata));
        object.score = initdata.score || 5;

        return object.save();
    }
}
