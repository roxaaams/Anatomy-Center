/* global chrome */
// @flow

import React from "react";

import WindowCloseIcon from "mdi-react/WindowCloseIcon";
import WindowMaximizeIcon from "mdi-react/WindowMaximizeIcon";
import WindowMinimizeIcon from "mdi-react/WindowMinimizeIcon";
import WindowRestoreIcon from "mdi-react/WindowRestoreIcon";

// $FlowIssue
import style from "./style.sass";

import { currentWindow, isExtension } from "./chrome.js";

export default (props: Object): any => isExtension && (
    <nav className={[style.nav, props.className].join(" ")}>
        <li className={[style.button, style.close].join(" ")} onClick={(): void => currentWindow.close()}><WindowCloseIcon /></li>
        <li className={[style.button, style.minimize].join(" ")} onClick={(): void => currentWindow.minimize()}><WindowMinimizeIcon /></li>
        <li className={[style.button, style.maximize].join(" ")} onClick={(): void => (currentWindow.isMaximized() ? currentWindow.restore() : currentWindow.maximize())}>{
            currentWindow.isMaximized() ? <WindowRestoreIcon /> : <WindowMaximizeIcon />
        }</li>
    </nav>
) || <span />;
