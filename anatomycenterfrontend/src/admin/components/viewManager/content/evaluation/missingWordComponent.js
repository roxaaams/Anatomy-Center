// @flow

import React, { Component, PropTypes } from "react";

import Input from "react-toolbox/lib/input";
import Table from "react-toolbox/lib/table";
import { Card, CardTitle, CardText, CardMedia } from "react-toolbox/lib/card";
import { Button } from "react-toolbox/lib/button";

import { Service as api } from "../../../auth";
import { injectState } from "shared/services/state"; // eslint-disable-line

import { throttle } from "lodash";

import matchedObjectStyle from "./missingwords"; // eslint-disable-line

@injectState(["language.code"])
class MissingWordsEditor extends Component {
    static propTypes = {
        question: PropTypes.string,
        state: PropTypes.shape({
            language: PropTypes.shape({
                code: PropTypes.string,
            }),
        }),
        refresh: PropTypes.func,
        index: PropTypes.number,
    }

    componentWillMount = async (): Promise<void> => {
        await this.refreshData();
    }

    refreshData = async (props: Object = this.props): Promise<void> => {
        this.setState({ data: await api.instance.request("get", `missingwords/${props.question}`) });
    }

    updateQuestion = throttle(
        async (): Promise<void> =>
            this.setState({ data: await api.instance.request("put", `missingwords/${this.props.question}`, JSON.stringify({
                questions: [{
                    lng: this.props.state.language.code,
                    question: this.state.questionText,
                }],
            })), questionText: null })
        , 2000, { leading: false })

    updateAnswers = throttle(
        async (): Promise<void> =>
            this.setState({ data: await api.instance.request("put", `missingwords/${this.props.question}`, JSON.stringify({ answers: this.state.data.answers.map((it: Object, index: Number): Object => ({
                number: this.state[`answers-${index}-number`] || it.number,
                texts: it.texts.find((text: Object): boolean => text.lng === this.props.state.language.code) && it.texts.map((text: Object): Object =>
                    text.lng === this.props.state.language.code && ({
                        lng: text.lng,
                        text: this.state[`answers-${index}-text`] || text.text,
                    })
                || text) || this.state[`answers-${index}-text`] && [...it.texts, {
                    lng: this.props.state.language.code,
                    text: this.state[`answers-${index}-text`],
                }] || it.texts,
            })) })) })
        , 2000, { leading: false })

    editorView(): Component {
        const { state: { language: { code: lng } }, index } = this.props;
        const { expanded, data, questionText } = this.state;

        if (!data) {
            return <h1>Loading question...</h1>;
        }

        const { answers, questions } = data;
        const activeQuestion = (questions.find((question: Object): boolean => question.lng === lng) || questions[0]).question;

        return (<Card className={matchedObjectStyle.wrapper}>
            <CardTitle className={matchedObjectStyle.title}>
                <h1>Puzzle #{index}</h1>
                <div>
                    <Button
                        primary={!expanded}
                        accent={expanded}
                        onClick={(): void => ::this.setState({ expanded: !expanded })}
                    >{expanded && "Hide" || "Show"}</Button>
                    <Button
                        accent
                        raised
                        onClick={(): void => api.instance.request("delete", `missingwords/${this.props.question}`).then(this.props.refresh)}
                    >Delete</Button>
                </div>
            </CardTitle>
            {expanded && <span>
                <CardText>
                    <Input
                        multiline
                        label="Puzzle Text"
                        hint="Lorem Ipsum ___(1) sit dolor..."
                        value={questionText || activeQuestion}
                        onChange={(value: string): void => this.setState({ questionText: value }, this.updateQuestion)}
                    />
                    <Table
                        model={{
                            text: { type: String },
                            number: { type: Number },
                        }}
                        source={answers.map((obj: Object, idx: Number): Object => ({
                            number: <Input
                                label="number number"
                                hint="0"
                                type="number"
                                value={this.state[`answers-${idx}-number`] || obj.number}
                                onChange={(value: number): void => this.setState({ [`answers-${idx}-number`]: value }, this.updateAnswers)}
                            />,
                            text: <Input
                                hint="Some number"
                                label="number to be matched"
                                value={this.state[`answers-${idx}-text`] || (obj.texts.find((text: Object): bool => text.lng === lng) || obj.texts[0]).text}
                                onChange={(value: number): void => this.setState({ [`answers-${idx}-text`]: value }, this.updateAnswers)}
                            />,
                        }))}
                        selectable
                        selected={this.state.selected}
                        onSelect={(selected: [Number]): any => this.setState({ selected })}
                        multiSelectable
                    />
                    {<Button
                        onClick={(): void => this.setState({ data: { ...data, answers: answers.filter((it: String, idx: Number): bool => this.state.selected.indexOf(idx) < 0) }, selected: [] }, this.updateAnswers)}
                        label="Delete Selected"
                        raised
                        accent
                    />}
                    <Button
                        label="Add answer"
                        raised
                        primary
                        onClick={(): void => api.instance.request("put", `missingwords/${this.props.question}`, JSON.stringify({
                            answers: [...this.state.data.answers, {
                                number: this.state.data.answers.length + 1,
                                texts: [{
                                    lng: "en_US",
                                    text: "New Answer",
                                }],
                            }],
                        })).then(this.refreshData.bind(this, this.props))}
                    />
                </CardText>
            </span>}
        </Card>);
    }

    render(): any {
        return (<div>{
            this.state && this.state.data
            ? this.editorView()
            : <h1>Loading...</h1>
        }</div>);
    }
}

export default class MissingWordsListComponent extends Component {
    static propTypes = {
        article: PropTypes.string,
        articleId: PropTypes.string,
    }

    componentWillMount = async (): Promise<void> => {
        await this.refreshData();
    }

    refreshData = async (props: Object = this.props): Promise<void> => {
        this.setState({ missingwords: await api.instance.request("get", `articles/slug/${props.article}/missingwords.ids`) });
    }

    render(): any {
        return (<div>{
            this.state && this.state.missingwords
            ? <div>
                {this.state.missingwords.map((it: String, index: Number): any => <MissingWordsEditor question={it} key={index} refresh={this.refreshData.bind(this, this.props)} index={index} />)}
                <Button
                    raised
                    primary
                    label="Add new matching object"
                    onClick={(): void => api.instance.request("post", `missingwords`, JSON.stringify({
                        belongsTo: this.props.articleId,
                        questions: [{
                            lng: "en_US",
                            question: "Fill in ___(1) with 'number Answer'",
                        }],
                        answers: [{
                            number: 0,
                            texts: [{
                                lng: "en_US",
                                text: "number Answer",
                            }],
                        }],
                    })).then(this.refreshData.bind(this, this.props))}
                />
            </div>
            : <h1>Loading...</h1>
        }</div>);
    }
}
