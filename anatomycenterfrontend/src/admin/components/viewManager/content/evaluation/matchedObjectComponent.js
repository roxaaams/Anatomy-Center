// @flow

import React, { Component, PropTypes } from "react";

import Input from "react-toolbox/lib/input";
import Table from "react-toolbox/lib/table";
import { Card, CardTitle, CardText, CardMedia } from "react-toolbox/lib/card";
import { Button } from "react-toolbox/lib/button";

import { Service as api } from "../../../auth";
import { injectState } from "shared/services/state"; // eslint-disable-line

import { throttle } from "lodash";

import matchedObjectStyle from "./matchedobjects"; // eslint-disable-line

@injectState(["language.code"])
class MatchObjectEditor extends Component {
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
        this.setState({ data: await api.instance.request("get", `matchedobjects/${props.question}`) });
    }

    updateMedia = throttle(
        async (): Promise<void> =>
            this.setState({ data: await api.instance.request("put", `matchedobjects/${this.props.question}`, JSON.stringify({
                image: this.state.imageUrl,
            })) })
        , 2000, { leading: false })

    updateAnswers = throttle(
        async (): Promise<void> =>
            this.setState({ data: await api.instance.request("put", `matchedobjects/${this.props.question}`, JSON.stringify({ answers: this.state.data.answers.map((it: Object, index: Number): Object => ({
                correct: this.state[`answers-${index}-correct`] || it.correct,
                words: it.words.find((word: Object): boolean => word.lng === this.props.state.language.code) && it.words.map((word: Object): Object =>
                    word.lng === this.props.state.language.code && ({
                        lng: word.lng,
                        word: this.state[`answers-${index}-text`] || word.word,
                    })
                || word) || this.state[`answers-${index}-text`] && [...it.words, {
                    lng: this.props.state.language.code,
                    word: this.state[`answers-${index}-text`],
                }] || it.words,
            })) })) })
        , 2000, { leading: false })

    editorView(): Component {
        const { state: { language: { code: lng } }, index } = this.props;
        const { expanded, data, imageUrl } = this.state;

        if (!data) {
            return <h1>Loading question...</h1>;
        }

        const { answers, image } = data;

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
                        onClick={(): void => api.instance.request("delete", `matchedobjects/${this.props.question}`).then(this.props.refresh)}
                    >Delete</Button>
                </div>
            </CardTitle>
            {expanded && <span>
                <CardMedia image={imageUrl || image} aspectRatio="wide" />
                <CardText>
                    <Input
                        value={imageUrl || image}
                        onChange={(img: String): void => this.setState({ imageUrl: img }, this.updateMedia)}
                        hint="//lorempixel.com/400/400"
                    />
                    <Table
                        model={{
                            text: { type: String },
                            number: { type: Number },
                        }}
                        source={answers.map((obj: Object, idx: Number): Object => ({
                            number: <Input
                                label="Correct number"
                                hint="0"
                                type="number"
                                value={this.state[`answers-${idx}-correct`] || obj.correct}
                                onChange={(value: number): void => this.setState({ [`answers-${idx}-correct`]: value }, this.updateAnswers)}
                            />,
                            text: <Input
                                hint="Some Word"
                                label="Word to be matched"
                                value={this.state[`answers-${idx}-text`] || (obj.words.find((word: Object): bool => word.lng === lng) || obj.words[0]).word}
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
                        onClick={(): void => api.instance.request("put", `matchedobjects/${this.props.question}`, JSON.stringify({
                            answers: [...this.state.data.answers, {
                                correct: this.state.data.answers.length + 1,
                                words: [{
                                    lng: "en_US",
                                    word: "New Answer",
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

export default class MatchObjectsComponent extends Component {
    static propTypes = {
        article: PropTypes.string,
        articleId: PropTypes.string,
    }

    componentWillMount = async (): Promise<void> => {
        await this.refreshData();
    }

    refreshData = async (props: Object = this.props): Promise<void> => {
        this.setState({ matchedobjects: await api.instance.request("get", `articles/slug/${props.article}/matchedobjects.ids`) });
    }

    render(): any {
        return (<div>{
            this.state && this.state.matchedobjects
            ? <div>
                {this.state.matchedobjects.map((it: String, index: Number): any => <MatchObjectEditor question={it} key={index} refresh={this.refreshData.bind(this, this.props)} index={index} />)}
                <Button
                    raised
                    primary
                    label="Add new matching object"
                    onClick={(): void => api.instance.request("post", `matchedobjects`, JSON.stringify({
                        belongsTo: this.props.articleId,
                        image: "https://storage.googleapis.com/gweb-uniblog-publish-prod/static/blog/images/google-200x200.7714256da16f.png",
                        answers: [{
                            correct: 0,
                            words: [{
                                lng: "en_US",
                                word: "Correct Answer",
                            }],
                        }],
                    })).then(this.refreshData.bind(this, this.props))}
                />
            </div>
            : <h1>Loading...</h1>
        }</div>);
    }
}
