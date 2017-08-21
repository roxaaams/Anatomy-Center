import React, { Component } from "react";

import { Card, CardActions, CardText, CardTitle } from "react-toolbox/lib/card";
import { Button } from "react-toolbox/lib/button";

import picker from "../../../shared/helpers/picker.js";
import { injectState } from "../../../shared/services/state.js";
import { hookRequest } from "../../../shared/services/api.js";
import { installLanguageSets } from "../../../shared/translation/decorators.js";

export default installLanguageSets("general", "users", "search")(hookRequest([({ comment }: Object): Object => ({
    name: "belongsTo",
    request: `articles/${comment.belongsTo}`,
})], false, false)(injectState(["language.code"])(({ translate, comment, belongsTo, history, showOwner, state: { language: { code } } }: Object): Component => (<Card>
    {showOwner &&
        <CardTitle
            title={comment.postedBy.name}
            subtitle={`${translate("Rank")} 1`}
        />}
    <CardText>
        {comment.comment}
    </CardText>
    <CardActions>
        {belongsTo && belongsTo.length === 1
            ? <Button label={`${translate("View")} ${picker(belongsTo[0].names, code).name}`} onClick={(): void => history.push(`/${picker(belongsTo[0].slugs, code).slug}`)} />
            : <Button label={`${translate("View")} ${translate("Search Query")}`} onClick={(): void => history.push(`/search/${comment.belongsTo}`)} />}
        {showOwner && <Button label={`${translate("View")} ${translate("Poster")}`} onClick={(): void => history.push(`/user/${comment.postedBy.email}`)} />}
    </CardActions>
</Card>))));
