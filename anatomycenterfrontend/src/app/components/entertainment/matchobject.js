
import React, { Component, PropTypes } from "react";

import { Card, CardTitle, CardText, CardActions, CardMedia } from "react-toolbox/lib/card";
import { Table } from "react-toolbox/lib/table";
import { Button } from "react-toolbox/lib/button";

import { injectState } from "../../../shared/services/state";
import { hookRequest } from "../../../shared/services/api.js";
import picker from "../../../shared/helpers/picker.js";

import style from "./questions.sass";
import { installLanguageSets } from "../../../shared/translation/decorators.js";

@installLanguageSets("general", "entertainment", "puzzles")
@injectState(["language.code"])
@hookRequest([({ id, type }: Object): Object => ({
    name: "question",
    request: `${type}/${id}`,
})], false, false)
export default class MatchObjectComponent extends Component {
    static propTypes = {
        state: PropTypes.shape({
            language: PropTypes.shape({
                code: PropTypes.string,
            }),
        }),
        question: PropTypes.object,
        translate: PropTypes.func,
        index: PropTypes.number,
        type: PropTypes.string,
    }

    state = {
        expanded: false,
    }

    getMatchReference(): Component {
        return this.props.type === "matchedobjects"
            ? (<CardMedia aspectRatio="wide" image={this.props.question.image} />)
            : (<CardText>
                {picker(this.props.question.questions, this.props.state.language.code).question}
            </CardText>);
    }

    render(): Component {
        const { state: { language: { code } }, question, translate, index, type } = this.props;
        const { checked, expanded } = this.state;

        if (!question) {
            return <h1>{translate("Loading")} {translate("question")}...</h1>;
        }

        const { answers } = question;

        return (<Card className={style.wrapper}>
            <CardTitle className={style.title} title={`${translate("Puzzle")} #${index}`}>
                <div>
                    <Button
                        primary={!this.state.expanded}
                        accent={this.state.expanded}
                        onClick={(): void => ::this.setState({ expanded: !this.state.expanded })}
                    >{this.state.expanded && translate("Hide") || translate("Show")}</Button>
                </div>
            </CardTitle>
            {expanded && <span>
                {this.getMatchReference()}
                <CardText>
                    <Table
                        model={{
                            number: { type: Number },
                            object: { type: String },
                        }}
                        selectable={false}
                        onChange={
                            (idx: number, prop: string, value: number): void => (prop === "number" && this.setState({ [`answer-${idx}`]: value }))
                        }
                        source={answers.map((answer: Object, idx: number): Object => ({
                            number: this.state[`answer-${idx}`] || 0,
                            object: picker(answer[type === "matchedobjects" ? "words" : "texts"], code)[type === "matchedobjects" ? "word" : "text"],
                        }))}
                    />
                </CardText>
                <CardActions className={style.right}>
                    <Button
                        accent
                        raised={checked}
                        onClick={(): void => ::this.setState({ checked: false })}
                        disabled={!checked}
                    >{translate("Reset")}</Button>
                    <Button
                        primary
                        raised={!checked}
                        onClick={(): void => ::this.setState({ checked: true })}
                        disabled={checked}
                    >{translate("Check")}</Button>
                </CardActions>
            </span>}
        </Card>);
    }
}
