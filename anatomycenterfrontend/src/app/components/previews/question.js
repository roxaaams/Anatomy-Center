import React, { Component } from "react";

import { Link } from "react-router-dom";
import { Card, CardTitle, CardText } from "react-toolbox/lib/card";
import Moment from "react-moment";

import picker from "../../../shared/helpers/picker.js";
import { injectState } from "../../../shared/services/state.js";
import { installLanguageSets } from "../../../shared/translation/decorators.js";

export default installLanguageSets("questions")(injectState(["language.code"])(({ translate, question, at, state: { language: { code } } }: Object): Component => (<Card>
    <CardTitle
        title={picker(question.questions, code).question}
        subtitle={<span>{translate("Value")}: {question.score || 5} {translate("points")}</span>}
    />
    <CardText>
        {at && <h1>
            {translate("Completed at")} <Moment fromNow>{at}</Moment>
        </h1>}
        <h4>{translate("Belongs to")} <Link to={`/${picker(question.belongsTo.slugs, code).slug}`}>{picker(question.belongsTo.names, code).name}</Link></h4>
    </CardText>
</Card>)));
