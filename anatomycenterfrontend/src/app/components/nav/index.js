// @flow
/* eslint-disable */

import React from "react";
import { IconMenu, MenuItem, MenuDivider } from "react-toolbox/lib/menu";
import LanguageComponent from "../../../shared/translation/component.js";
import { Link } from "react-router-dom";
import FacebookLogin from "react-facebook-login";
import ApiService, { injectLoginState } from "../../../shared/services/api";
import { injectState } from "../../../shared/services/state.js";
import { installLanguageSets } from "../../../shared/translation/decorators.js";

const facebookAppId = "518827715115427";
const api = ApiService.getInstance();

import style from "./style.sass";
export default installLanguageSets("nav", "content")(injectState(["theme"], true)(injectLoginState(({ userData, history, state: { theme }, setTheme, translate }: Object): any => (<nav className={style.bar}>
    <Link to="/">{translate("Anatomy Center")}</Link>
    <div className={style.search}>
        <input type="search" onKeyUp={({ keyCode, target }: Object): void => keyCode === 13 && history.push(`/search/${encodeURI(target.value)}`) && (target.value = "")} />
        <span className="mdi mdi-magnify" />
    </div>
    <div className={style.user}>
        <LanguageComponent />
        <IconMenu icon={<span className={"mdi mdi-menu"} />} position="topRight" menuRipple>
            <MenuItem
                onClick={(): void => history.push("/user/leaderboards")}
                caption={translate("Leaderboards")}
                icon={<span className={"mdi mdi-format-list-numbers"} />}
            />
            <MenuItem
                className={style.theme}
                onClick={(): void => setTheme(theme === "dark" ? "light" : "dark")}
                caption={translate("Change Theme")}
                icon={<span className={"mdi mdi-theme-light-dark"} />}
            />
            <MenuDivider />
            <MenuItem
                icon={<span className="mdi mdi-voice" />}
                caption={translate("Leave Feedback")}
                onClick={() => {
                    const link = `https://bitbucket.org/roxanamafteiuscai/anatomycenterfrontend/issues/new?title=${encodeURI(`Feedback`)}&content=${encodeURI(`I have found a problem with the webiste, or something that can be improved upon. \n        Found at: ${window.location.pathname}`)}\n\nDetails follow:\n`;
                    window.open(link, "_blank");
                }}
            />
            <MenuDivider />
            {userData
                ? [
                    <MenuItem
                        onClick={api.logout}
                        icon={<span className="mdi mdi-logout" />}
                        caption={translate("Logout")}
                    />,
                    <MenuItem
                        caption={userData.name}
                        onClick={(): void => history.push("/user/me")}
                        icon={<div className={style.avatar}><img src={userData.picture} key="avatar" role="presentation" /></div>}
                    />,
                ]
                : <MenuItem>
                    <FacebookLogin
                        appId={facebookAppId}
                        // autoLoad
                        fields="name,email,picture"
                        icon={`mdi mdi-facebook ${style.facebook}`}
                        callback={api.login}
                        size="small"
                        textButton=""
                    />
                </MenuItem>
            }
        </IconMenu>
    </div>
</nav>))));
