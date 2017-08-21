/* global WEBPACK_BUILD WEBPACK_ENV IS_DIST IS_DEV */
// @flow
require("../shared/styles/reset.scss"); // eslint-disable-line
require("../shared/styles/global.sass"); // eslint-disable-line
require("../shared/styles/flags.css"); // eslint-disable-line

require("!style!css!resolve-url!sass!mdi/scss/materialdesignicons.scss"); // eslint-disable-line

import { Route } from "react-router-dom";
import { CurrentRouter } from "../shared/helpers/window/chrome.js";

import { render } from "react-dom";
import React from "react";

import { ThemeProvider } from "react-css-themr";
import theme from "../shared/styles/theme.js";

import { Service as TranslateService } from "translation"; // eslint-disable-line
TranslateService.getValidSets(require.context("./config/languages"));

import { Service as ApiService } from "api"; // eslint-disable-line
import config from "config"; // eslint-disable-line

ApiService.instance.config({
    apiEndpoint: config.api,
    // runFakeServer: IS_DEV,
});

// if (IS_DEV) {
const { Service } = require("api"); // eslint-disable-line
// const items = require("configDir/fakedata"); // eslint-disable-line
// console.log("ITEMS", items);
// Service.instance._loadFakeAPIData(items);
// }

import App from "./components/app.js";

if (IS_DIST && "serviceWorker" in navigator) {
    (async (): Promise<void> => {
        console.log("Will install service worker");
        try {
            const shouldRestart = !navigator.serviceWorker.controller;
            const registration = await navigator.serviceWorker.register(`/${WEBPACK_BUILD}.sw.js`);
            if (shouldRestart) {
                window.location = window.location;
            }
            console.log("Service worker installed on scope ", registration.scope);
        } catch (e) {
            console.error("Service worker not installed", e);
        }
    })();
}

render(<ThemeProvider theme={theme}>
    <CurrentRouter>
        <Route path="/" component={App} />
    </CurrentRouter>
</ThemeProvider>, document.getElementsByClassName("app")[0]);
setTimeout(() => {
    document.querySelector("body").className += " active";
}, 1000);
