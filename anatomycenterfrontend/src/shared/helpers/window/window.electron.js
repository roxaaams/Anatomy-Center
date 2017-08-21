/* eslint-disable global-require */
export default require("electron") && require("electron").remote && require("electron").remote.BrowserWindow && require("electron").remote.BrowserWindow.getFocusedWindow();
