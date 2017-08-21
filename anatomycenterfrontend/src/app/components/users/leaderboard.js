import React, { Component } from "react";
import { hookRequest } from "../../../shared/services/api";

import UserPreview from "../previews/user.js";
import style from "./style.sass";
import { installLanguageSets } from "../../../shared/translation/decorators.js";

export default installLanguageSets("leaderboards", "general", "content")(hookRequest([{
    request: "users/top/10",
    name: "list",
}], false, false)(({ list, history, translate }: Object): Component => <section className={[style.container, style.noflex, style.padded].join(" ")}>
    <section
        style={{
            width: "100%",
            height: "100%",
            overflowY: "auto",
        }}
    >
        <h1 className={style.title}>{translate("Leaderboards")}: </h1>
        {list
            && list.length > 0
                && list.map((user: Object): Component => <UserPreview {...{ user, history }} />)
                || <h1>{translate("There are no users")}</h1>
            || <h1>{translate("Loading")} {translate("Leaderboards")}</h1>
        }
    </section>
</section>));
