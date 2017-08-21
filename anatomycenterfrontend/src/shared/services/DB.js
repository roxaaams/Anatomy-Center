/* global jest */
/* eslint-disable global-require */

if (typeof(jest) !== "undefined") {
    jest.unmock("util.js");
}

let PouchDB;
if (process.env.NODE_ENV === "test") {
    PouchDB = require("pouchdb");
} else {
    PouchDB = require("pouchdb-browser");
}


const db = new PouchDB("storage");

if (process.env.NODE_ENV === "development") {
    window.PouchDB = PouchDB;
    window.db = db;
}

export default db;
