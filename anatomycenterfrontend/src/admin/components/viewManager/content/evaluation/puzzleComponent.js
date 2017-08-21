import React, { Component, PropTypes } from "react";

import Input from "react-toolbox/lib/input";
import { Card, CardTitle, CardText, CardMedia } from "react-toolbox/lib/card";
import { Button } from "react-toolbox/lib/button";

import { Service as api } from "../../../auth";
import { injectState } from "shared/services/state"; // eslint-disable-line

import { throttle } from "lodash";

import puzzleStyle from "./puzzles"; // eslint-disable-line

class PuzzleEditor extends Component {
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
        this.setState({ data: await api.instance.request("get", `puzzles/${props.question}`) });
    }

    updateMedia = throttle(
        async (): Promise<void> =>
            this.setState({ puzzleLink: null, data: await api.instance.request("put", `puzzles/${this.props.question}`, JSON.stringify({
                image: this.state.puzzleLink,
            })) })
        , 2000, { leading: false })

    editorView(): Component {
        const { expanded, data, puzzleLink } = this.state;
        const { index } = this.props;

        if (!data) {
            return <h1>Loading puzzle...</h1>;
        }

        return (<Card className={puzzleStyle.wrapper}>
            <CardTitle className={puzzleStyle.title}>
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
                        onClick={(): void => api.instance.request("delete", `puzzles/${this.props.question}`).then(this.props.refresh)}
                    >Delete</Button>
                </div>
            </CardTitle>
            {expanded && <span>
                <CardMedia aspectRatio="wide" image={puzzleLink || data.image} />
                <CardText>
                    <Input
                        hint="//lorempixel.com/400/400"
                        label="Media link"
                        value={puzzleLink || data.image}
                        onChange={(text: String): void => this.setState({ puzzleLink: text }, this.updateMedia)}
                        className={puzzleStyle.input}
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

export default class PuzzlesEditor extends Component {
    static propTypes = {
        article: PropTypes.string,
        articleId: PropTypes.string,
    }

    componentWillMount = async (): Promise<void> => {
        await this.refreshData();
    }

    refreshData = async (props: Object = this.props): Promise<void> => {
        this.setState({ questions: await api.instance.request("get", `articles/slug/${props.article}/puzzles.ids`) });
    }

    render(): any {
        return (<div>{
            this.state && this.state.questions
            ? <div>
                {this.state.questions.map((it: String, index: Number): any => <PuzzleEditor question={it} key={index} refresh={this.refreshData.bind(this, this.props)} index={index} />)}
                <Button
                    raised
                    primary
                    label="Add new puzzle"
                    onClick={(): void => api.instance.request("post", `puzzles`, JSON.stringify({
                        belongsTo: this.props.articleId,
                        image: "http://lorempixel.com/400/400",
                    })).then(this.refreshData.bind(this, this.props))}
                />
            </div>
            : <h1>Loading...</h1>
        }</div>);
    }
}
