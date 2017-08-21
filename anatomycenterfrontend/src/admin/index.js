// @flow

require("./styles/global.sass"); // eslint-disable-line
require("./styles/flags.css"); // eslint-disable-line

require("!style!css!resolve-url!sass!sweetalert/dist/sweetalert.css"); // eslint-disable-line
require("!style!css!resolve-url!sass!mdi/scss/materialdesignicons.scss"); // eslint-disable-line

import App from "./components/main";
import { render } from "react-dom";
import React from "react";
import { Service as TranslateService } from "../shared/translation";
import { Service as AuthService } from "./components/auth";

import { ThemeProvider } from "react-css-themr";
import theme from "../shared/styles/theme.js";

TranslateService.getValidSets(require.context("./config/languages"));
console.log(AuthService.instance.token);

render(<ThemeProvider theme={theme}><App /></ThemeProvider>, document.getElementsByClassName("app")[0]);
