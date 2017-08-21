// @flow

import serverPromise from "../../../scaffolding/server.js";

import UserModel from "../../models/UserModel.js";
import { expect } from "chai";

describe("HAPI Server", () => {
    let server;

    it("shuld do basic maths (sanity check)", () => {
        expect(true).to.not.equal(false);
        expect(2 + 2).to.equal(4);
    });

    describe("should run all patronus tests", async (): Promise<void> => {
        const { getServer } = await serverPromise;
        server = getServer();

        const id = Date.now();
        const email = `test${id}@b.com`;
        const password = `test${id}`;
        const name = `Test Account ${id}`;

        before((done: Function): void => server.inject({
            method: "POST",
            url: "/api/v1/users",
            payload: {
                email,
                password,
                name
            },
        }, (response: Object) => {
            expect(response.statusCode).to.equal(200);
            const users = [response.result];

            expect(users.length).to.equal(1);
            expect(users[0].email).to.equal(email);
            expect(users[0].name).to.equal(name);

            done();
        }));

        after((done: Function): void => server.inject({
            method: "DELETE",
            url: `/api/v1/users/${email}`,
        }, async (response: Object): Promise<void> => {
            expect(response.statusCode).to.equal(200);

            const model = await UserModel.getModel();
            const users = await model.byEmail(email);

            expect(users.length).to.equal(0);
            done();
        }));

        it("should have created the test user properly", async (): Promise<void> => {
            const model = await UserModel.getModel();
            const users = await model.byEmail(email);

            expect(users.length).to.equal(1);
            expect(users[0].email).to.equal(email);
            expect(users[0].password).to.equal(UserModel.prototype.hashPassword(password));
            expect(users[0].name).to.equal(name);

            return;
        });

        return;
    });
});
