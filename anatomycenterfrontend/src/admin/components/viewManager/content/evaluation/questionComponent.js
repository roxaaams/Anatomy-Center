import React, { Component, PropTypes } from "react";

import Input from "react-toolbox/lib/input";
import { Card, CardTitle, CardText } from "react-toolbox/lib/card";
import { RadioGroup, RadioButton } from "react-toolbox/lib/radio";
import { Button } from "react-toolbox/lib/button";

import { Service as api } from "../../../auth";
import { injectState } from "shared/services/state"; // eslint-disable-line

import { throttle } from "lodash";

import questionStyle from "./questions"; // eslint-disable-line

@injectState(["language.code"])
class QuestionEditor extends Component {
    static propTypes = {
        question: PropTypes.string,
        state: PropTypes.shape({
            language: PropTypes.shape({
                code: PropTypes.string,
            }),
        }),
        refresh: PropTypes.func,
    }

    componentWillMount = async (): Promise<void> => {
        await this.refreshData();
    }

    refreshData = async (props: Object = this.props): Promise<void> => {
        this.setState({ data: await api.instance.request("get", `questions/${props.question}`) });
    }

    updateQuestion = throttle(
        async (): Promise<void> =>
            this.setState({ data: await api.instance.request("put", `questions/${this.props.question}`, JSON.stringify({
                questions: [{
                    lng: this.props.state.language.code,
                    question: this.state.questionText,
                }],
            })) })
        , 2000, { leading: false })

    updateAnswers = throttle(
        async (): Promise<void> =>
            this.setState({
                ...(Array(this.state.data.answers.length).fill().reduce((prev: Object, it: void, index: number): Object => ({ ...prev, [`answer-${index}-text`]: null }), {})),
                data: await api.instance.request("put", `questions/${this.props.question}`, JSON.stringify({ answers: this.state.data.answers.map((it: Object, index: Number): Object => ({
                    ...it,
                    texts: it.texts.find((text: Object): boolean => text.lng === this.props.state.language.code) && it.texts.map((text: Object): Object => text.lng === this.props.state.language.code && ({
                        lng: text.lng,
                        text: this.state[`answer-${index}-text`] || text.text,
                    }) || text) || this.state[`answer-${index}-text`] && [...it.texts, {
                        lng: this.props.state.language.code,
                        text: this.state[`answer-${index}-text`],
                    }] || it.texts,
                })) })),
            })
        , 2000, { leading: false })

    editorView(): Component {
        const lng = this.props.state.language.code;
        const { checked, value, expanded, data, questionText } = this.state;

        if (!data) {
            return <h1>Loading question...</h1>;
        }

        const { questions, answers } = data;

        const activeQuestion = (questions.find((it: Object): bool => it.lng === lng) || questions[0]).question;
        const activeAnswerIndex = answers.findIndex((it: Object): bool => it.correct);

        return (<Card className={questionStyle.wrapper}>
            <CardTitle className={questionStyle.title}>
                <Input
                    hint="What is the meaning of life?"
                    label="Question title"
                    value={questionText || activeQuestion}
                    onChange={(text: String): void => this.setState({ questionText: text }, this.updateQuestion)}
                    className={questionStyle.input}
                />
                <div>
                    <Button
                        primary={!expanded}
                        accent={expanded}
                        onClick={(): void => ::this.setState({ expanded: !expanded })}
                    >{expanded && "Hide" || "Show"}</Button>
                    <Button
                        accent
                        raised
                        onClick={(): void => api.instance.request("delete", `questions/${this.props.question}`).then(this.props.refresh)}
                    >Delete</Button>
                </div>
            </CardTitle>
            {expanded && <span>
                <CardText>
                    <RadioGroup
                        value={activeAnswerIndex}
                        onChange={(val: Number): void => api.instance.request("put", `questions/${this.props.question}`, JSON.stringify({
                            answers: answers.map((it: Object, index: Number): Object => ({
                                ...it,
                                correct: index === val,
                            })),
                        })).then(this.refreshData.bind(this, this.props))}
                    >
                        {answers.map((question: String, index: Number): Component =>
                            <RadioButton
                                key={index}
                                className={[
                                    questionStyle.option,
                                    checked && (value === index && question.correct && questionStyle.correct || questionStyle.incorrect),
                                    this.state.value === index && questionStyle.answered,
                                ].join(" ")}
                                label={((activeText: String): any => <div>
                                    <Input
                                        hint="42 is the answer"
                                        label="Answer Text"
                                        value={this.state[`answer-${index}-text`] || activeText}
                                        className={questionStyle.input}
                                        onChange={(text: String): void => this.setState({ [`answer-${index}-text`]: text }, this.updateAnswers)}
                                    />
                                    <Button
                                        raised
                                        accent
                                        label={"Remove"}
                                        onClick={(): void => api.instance.request("put", `questions/${this.props.question}`, JSON.stringify({
                                            answers: this.state.data.answers.filter((it: Object, idx: Number): bool => idx !== index),
                                        })).then(this.refreshData.bind(this, this.props))}
                                    />
                                </div>)((question.texts.find((it: Object): bool => it.lng === lng) || question.texts[0]).text)}
                                value={index}
                            />
                        )}
                    </RadioGroup>
                    <Button
                        label="Add answer"
                        raised
                        primary
                        onClick={(): void => api.instance.request("put", `questions/${this.props.question}`, JSON.stringify({
                            answers: [...this.state.data.answers, {
                                correct: false,
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

export default class QuestionsEditor extends Component {
    static propTypes = {
        article: PropTypes.string,
        articleId: PropTypes.string,
    }

    componentWillMount = async (): Promise<void> => {
        await this.refreshData();
    }

    refreshData = async (props: Object = this.props): Promise<void> => {
        this.setState({ questions: await api.instance.request("get", `articles/slug/${props.article}/questions.ids`) });
    }

    render(): any {
        return (<div>{
            this.state && this.state.questions
            ? <div>
                {this.state.questions.map((it: String, index: Number): any => <QuestionEditor question={it} key={index} refresh={this.refreshData.bind(this, this.props)} />)}
                <Button
                    raised
                    primary
                    label="Add new question"
                    onClick={(): void => api.instance.request("post", `questions`, JSON.stringify({
                        belongsTo: this.props.articleId,
                        questions: [{
                            lng: "en_US",
                            question: "New Question",
                        }],
                        answers: [{
                            correct: true,
                            texts: [{
                                lng: "en_US",
                                text: "Correct Answer",
                            }],
                        }, {
                            correct: false,
                            texts: [{
                                lng: "en_US",
                                text: "Incorrect Answer",
                            }],
                        }],
                    })).then(this.refreshData.bind(this, this.props))}
                />
            </div>
            : <h1>Loading...</h1>
        }</div>);
    }
}
