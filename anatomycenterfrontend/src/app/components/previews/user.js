import React, { Component } from "react";

import { Card, CardTitle, CardActions } from "react-toolbox/lib/card";
import { Button } from "react-toolbox/lib/button";

import md5 from "md5";

import { installLanguageSets } from "../../../shared/translation/decorators.js";
import config from "../../config/users.js";

export const component = ({ user, history, translate }: Object): Component => (<Card>
    <CardTitle
        title={user.name}
        subtitle={`${translate("Rank")} ${config.tiers.reduce((prev: number, it: number, index: number): number => ((user.score || 0) > it ? index : prev), -1) + 2}`}
        avatar={user.picture || `http://www.gravatar.com/avatar/${md5(user.email)}`}
    />
    <CardActions>
        <Button onClick={(): void => history.push(`/user/${user.email}`)}>{translate("View")} {translate("User")}</Button>
    </CardActions>
</Card>);
export default installLanguageSets("general", "users")(component);
