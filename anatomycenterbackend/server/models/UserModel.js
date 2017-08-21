import crypto from "crypto";
import BaseModel from "./BaseModel";
import EntertainmentModel from "./EntertainmentModel";
import { Schema } from "mongoose";

export default class UserModel extends BaseModel {
    static schema = {
        name: String,
        password: String,
        email: String,
        score: Number,
        hasAdminRight: Boolean,
        picture: String,
        completed: [{
            completed: { type: Schema.Types.ObjectId, ref: EntertainmentModel._name },
            at: Date,
        }],
    }

    static indexes = [{
        name: "text",
    }]

    static async byEmail(mail: string): UserModel {
        return this.find({ email: mail }).exec();
    }

    static async byId(_id: string): UserModel {
        return this.find({ _id }).exec();
    }

    static async byRight(hasAdminRight: boolean): UserModel {
        return this.find({ hasAdminRight }).exec();
    }

    static async new(initdata: Object): Promise {
        const model = await UserModel.getModel();
        const data = await model.byEmail(initdata.email);

        if (data.length !== 0) {
            throw new Error("User already exists!");
        }

        const object = (new this(initdata));
        object.secure();

        object.score = 0;
        object.hasAdminRight = false;

        return object.save();
    }

    async authenticate(password: string): boolean {
        if (this.password !== this.hashPassword(password)) {
            throw new Error("The password does not match");
        }

        return true;
    }

    hashPassword(password: string): string {
        const hash = crypto.createHash("sha256");
        hash.update(password);

        return hash.digest("base64");
    }

    secure(): UserModel {
        if (this.password) {
            this.password = this.hashPassword(this.password);
        }

        return this;
    }
}
