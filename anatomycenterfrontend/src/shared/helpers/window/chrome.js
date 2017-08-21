// @flow
/* eslint-disable global-require */

import { BrowserRouter, HashRouter } from "react-router-dom";

export const isExtension = ["electron"].indexOf(process.env.NODE_TARGET) >= 0;
export const CurrentRouter = isExtension ? HashRouter : BrowserRouter;

export const currentWindow = require(`./window.${process.env.NODE_TARGET}`);
