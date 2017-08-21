import React, { Component } from "react";

import { Card, CardTitle, CardActions, CardMedia } from "react-toolbox/lib/card";
import { Button } from "react-toolbox/lib/button";

import picker from "../../../shared/helpers/picker.js";
import { injectState } from "../../../shared/services/state.js";
import { installLanguageSet } from "../../../shared/translation/decorators.js";

export default installLanguageSet("general")(injectState(["language.code"])(({ article, history, state: { language: { code } }, translate }: Object): Component => (<Card>
    <CardTitle
        title={picker(article.names, code).name}
        subtitle={picker(article.descriptions, code).description.replace(/((!?\w+\s*){10}).*$/, "$1")}
    />
    {article.media && article.media.length > 0 && <CardMedia
        image={article.media[parseInt(Math.random() * article.media.length, 10)]}
        aspectRatio="wide"
    />}
    <CardActions>
        <Button onClick={(): void => history.push(`/${picker(article.slugs, code).slug}`)}>{translate("Read More")}</Button>
    </CardActions>
</Card>)));
