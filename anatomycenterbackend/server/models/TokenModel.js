import BaseModel from "./BaseModel";
import { v1 } from "node-uuid";

// Defines
const second = 1000;
const minute = 60 * second;
const hour = 60 * minute;
const day = hour * 24;

// How long a token will be valid
const validDuration = 1 * day;

export default class TokenModel extends BaseModel {
    static schema = {
        token: String,
        email: String,
        valid: Date,
    }

    static async byEmail(mail: string): TokenModel {
        return this.find({ email: mail }).exec();
    }

    static async byToken(token: string): TokenModel {
        return this.find({ token }).exec();
    }

    static async new(email: string): Promise {
        const model = await TokenModel.getModel();
        const data = await model.byEmail(email);
        let object;

        if (data.length === 1 && data[0].isValid()) {
            object = data[0];
        } else {
            console.log("=== HERE", data.lenght);

            if (data.lenght > 0) {
                await model.remove({ email });
            }

            object = new this({ email });
        }

        if (!object.token) {
            object.token = v1();
        }
        object.extend();

        return object.save();
    }

    isValid(): boolean {
        if ((new Date()) < this.valid) {
            return true;
        }

        return false;
    }

    extend(): TokenModel {
        this.valid = new Date((new Date()).getTime() + validDuration);

        return this;
    }
}
