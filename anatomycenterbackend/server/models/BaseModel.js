import mongoose from "mongoose";
import check from "check-types";
import _ from "lodash";

import fs from "fs";
import path from "path";

import { intervalToAsync } from "../../utils/async";
import Joi from "joi";

const schemas = new WeakMap();
const models = new WeakMap();
const methodExcluder = ["constructor"];
const smethodExcluder = ["constructor", "prototype", "name", "schema", "model", "length", "arguments", "modelName", "caller", "plugins", "connection", "_gridfs"];

mongoose.Promise = global.Promise;

class BaseModel {

    static schema = {
        test: String,
    }

    // Generators
    static async getModel(): mongoose.model {
        const schema = await this.getSchema();

        if (!models.has(this)) {
            const model = mongoose.model(this._name, schema);
            models.set(this, model);

            if (check.array(this.discriminate)) {
                this.discriminate.forEach((discriminator: Object) => {
                    const schemaInstance = new mongoose.Schema(discriminator.schema);

                    if (check.array(discriminator.indexes)) {
                        discriminator.indexes.forEach((index: Object): void => schemaInstance.index(index));
                    }

                    if (check.array(discriminator.plugins)) {
                        discriminator.plugins.forEach((plugin: Object): void => schemaInstance.plugin(plugin));
                    }

                    model[discriminator.name] = model.discriminator(
                        discriminator.name,
                        schemaInstance,
                    );
                });
            }
        }

        return models.get(this);
    }

    static async getSchema(): mongoose.Schema {
        await this.connect();

        if (!schemas.has(this)) {
            const schemaInstance = new mongoose.Schema(this.schema);
            const methods = _.difference(Object.getOwnPropertyNames(this.prototype), methodExcluder) || [];
            const smethods = _.difference(Object.getOwnPropertyNames(this), smethodExcluder) || [];

            _.assign(schemaInstance.methods, methods.reduce(
                (prev: Object, method: Function): Object => true && { ...prev, [method]: this.prototype[method] }
            , {}));

            const _schema = this.schema;
            _.assign(schemaInstance.methods, { export: function _export(): void {
                return Object.keys(_schema).reduce(
                    (prev: Object, key: String): BaseModel =>
                        this[key] && { ...prev, [key]: this[key] } || prev
                    , {});
            } });
            _.assign(schemaInstance.statics, smethods.reduce(
                (prev: Object, method: Function): Object => true && { ...prev, [method]: this[method] }
            , {}));

            if (check.array(this.indexes)) {
                this.indexes.forEach((index: Object): void => schemaInstance.index(index));
            }

            if (check.array(this.plugins)) {
                this.plugins.forEach((plugin: Object): void => schemaInstance.plugin(plugin));
            }

            schemas.set(this, schemaInstance);
        }

        return schemas.get(this);
    }

    static get _name(): String {
        return (this.modelName || this.name || "").replace(/model/ig, "").toLowerCase();
    }

    static async connect(): Promise<boolean> {
        const checkConnection = (): Promise<boolean> => {
            if (mongoose.connection.readyState === 1) {
                return true;
            }

            if (mongoose.connection.readyState !== 2) {
                const dbConfigurationPath = path.resolve(__dirname, "../config/db.json");
                const getDBConfiguration = fs.existsSync(dbConfigurationPath) ? JSON.parse(fs.readFileSync(dbConfigurationPath)) : {};
                const configuration = _.assign({
                    host: process.env.AC_MONGO_HOST || "localhost",
                    port: process.env.AC_MONGO_PORT || "27017",
                    database: process.env.AC_MONGO_DB || "test",
                }, getDBConfiguration || {});
                const authentication = (getDBConfiguration.authentication && `${getDBConfiguration.authentication.username}:${getDBConfiguration.authentication.password}@`) || "";
                const connectionString = `mongodb://${authentication}${configuration.host}:${configuration.port}/${configuration.database}`;

                mongoose.connect(connectionString);
            }

            return false;
        };

        return await intervalToAsync(checkConnection, 50);
    }

    static get joiFields(): Object {
        let schema = Object.keys(this.schema);
        if (this.schemaNoForm) {
            schema = schema.filter((it: String): boolean => !this.schemaNoForm.includes(it));
        }
        const descriptions = schema.map((it: String): String =>
            this.schemaFieldDescriptions && this.schemaFieldDescriptions[it] || `"${it}" field`
        );
        const result = schema.reduce((prev: Object, it: String, index: Number): Object => true && {
            ...prev,
            [it]: Joi[
                ((this.schema[it] instanceof String) && "string") ||
                ((this.schema[it] instanceof Number) && "number") ||
                "string"
            ]()[
                this.schemaOptionals && this.schemaOptionals.includes(it) && "optional" || "required"
            ]().description(descriptions[index]),
        }, {});
        return result;
    }

}

export default BaseModel;
