
import React, { Component, PropTypes } from "react";

import { Card, CardTitle, CardText, CardActions } from "react-toolbox/lib/card";
import { RadioGroup, RadioButton } from "react-toolbox/lib/radio";
import { Button } from "react-toolbox/lib/button";

import { injectState } from "../../../shared/services/state";
import { hookRequest } from "../../../shared/services/api.js";
import picker from "../../../shared/helpers/picker.js";

import { installLanguageSets } from "../../../shared/translation/decorators.js";

import style from "./questions.sass";

@installLanguageSets("general", "puzzles")
@injectState(["language.code"])
@hookRequest([({ id }: Object): Object => ({
    name: "question",
    request: `questions/${id}`,
})], false, false)
export default class QuestionComponent extends Component {
    static propTypes = {
        state: PropTypes.shape({
            language: PropTypes.shape({
                code: PropTypes.string,
            }),
        }),
        question: PropTypes.object,
        translate: PropTypes.func,
    }

    state = {
        value: null,
        checked: false,
        expanded: false,
    }

    render(): Component {
        const { state: { language: { code } }, question, translate } = this.props;
        const { checked, value, expanded } = this.state;

        if (!question) {
            return <h1>{translate("Loading")} {translate("questoin")}...</h1>;
        }

        const { questions, answers } = question;

        const activeQuestion = (picker(questions, code)).question;

        return (<Card className={style.wrapper}>
            <CardTitle className={style.title} title={activeQuestion}>
                <div>
                    <Button
                        primary={!this.state.expanded}
                        accent={this.state.expanded}
                        onClick={(): void => ::this.setState({ expanded: !this.state.expanded })}
                    >{this.state.expanded && translate("Hide") || translate("Show")}</Button>
                    <Button disabled>
                        {checked && translate("Answered") || translate("Not answered")}
                        {checked && value === answers[value].correct && ` ${translate("correctly")}` || ""}
                    </Button>
                </div>
            </CardTitle>
            {expanded && <span>
                <CardText>
                    <RadioGroup
                        value={value}
                        onChange={
                            (val: Number): void => ::this.setState({ value: val })
                        }
                    >
                        {answers.map((_question: String, index: Number): Component =>
                            <RadioButton
                                key={index}
                                className={[
                                    style.option,
                                    checked && (value === index && _question.correct && style.correct || style.incorrect),
                                    this.state.value === index && style.answered,
                                ].join(" ")}
                                label={picker(_question.texts, code).text}
                                value={index}
                                disabled={checked}
                            />
                        )}
                    </RadioGroup>
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
