// @flow

import React, { Component, PropTypes } from "react";

import Input from "react-toolbox/lib/input";
import { Card, CardTitle } from "react-toolbox/lib/card";
import { Button } from "react-toolbox/lib/button";

import { Service as api } from "../../../auth";
import { injectState } from "shared/services/state"; // eslint-disable-line

import { throttle } from "lodash";

import reversedWordStyle from "./reversedwords"; // eslint-disable-line

@injectState(["language.code"])
class ReversedWordEditor extends Component {
    static propTypes = {
        keyword: PropTypes.string,
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
        this.setState({ data: (await api.instance.request("get", `reversedwords/${props.keyword}`))[0] });
    }

    updateQuestion = throttle(
        async (): Promise<void> =>
            this.setState({ data: await api.instance.request("put", `reversedwords/${this.props.keyword}`, JSON.stringify({
                keywords: [{
                    lng: this.props.state.language.code,
                    word: this.state.questionText,
                }],
            })) })
        , 2000, { leading: false })

    editorView(): Component {
        const lng = this.props.state.language.code;
        const { data, questionText } = this.state;

        if (!data) {
            return <h1>Loading words...</h1>;
        }

        const { keywords } = data;

        const activeQuestion = (keywords.find((it: Object): bool => it.lng === lng) || keywords[0]).word;

        return (<Card className={reversedWordStyle.wrapper}>
            <CardTitle className={reversedWordStyle.title}>
                <Input
                    hint="What is the meaning of life?"
                    label="Question title"
                    value={questionText || activeQuestion}
                    onChange={(text: String): void => this.setState({ questionText: text }, this.updateQuestion)}
                    className={reversedWordStyle.input}
                />
                <div>
                    <Button
                        accent
                        raised
                        onClick={(): void => api.instance.request("delete", `reversedwords/${this.props.keyword}`).then(this.props.refresh)}
                    >Delete</Button>
                </div>
            </CardTitle>
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

export default class ReversedWordsEditor extends Component {
    static propTypes = {
        article: PropTypes.string,
        articleId: PropTypes.string,
    }

    componentWillMount = async (): Promise<void> => {
        await this.refreshData();
    }

    refreshData = async (props: Object = this.props): Promise<void> => {
        this.setState({ keywords: await api.instance.request("get", `articles/slug/${props.article}/reversedwords.ids`) });
    }

    render(): any {
        return (<div>{
            this.state && this.state.keywords
            ? <div>
                {this.state.keywords.map((it: String, index: Number): any => <ReversedWordEditor reversedword={it} key={index} refresh={this.refreshData.bind(this, this.props)} />)}
                <Button
                    raised
                    primary
                    label="Add new word to be reversed"
                    onClick={(): void => api.instance.request("post", `reversedwords`, JSON.stringify({
                        belongsTo: this.props.articleId,
                        keywords: [{
                            lng: "en_US",
                            word: "Word",
                        }],
                    })).then(this.refreshData.bind(this, this.props))}
                />
            </div>
            : <h1>Loading...</h1>
        }</div>);
    }
}
