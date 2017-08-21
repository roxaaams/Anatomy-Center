// @flow

import React, { Component, PropTypes } from "react";

import NavComponent from "./navComponent";
import QuestionsEditor from "./evaluation/questionComponent";
import ReversedWordsEditor from "./evaluation/reversedWordComponent";
import PuzzlesEditor from "./evaluation/puzzleComponent";
import MatchObjectsComponent from "./evaluation/matchedObjectComponent";
import MissingWordsEditor from "./evaluation/missingWordComponent";

import Input from "react-toolbox/lib/input";
import Table from "react-toolbox/lib/table";
import { Tab, Tabs } from "react-toolbox/lib/tabs";
import { Button } from "react-toolbox/lib/button";

import marked from "marked";

import { Service as api } from "../../auth";
import { injectState } from "shared/services/state"; // eslint-disable-line

import { throttle } from "lodash";

import style from "./style"; // eslint-disable-line
import navStyle from "./nav.sass"; // eslint-disable-line

@injectState(["language.code"])
class ContentEditor extends Component {
    static propTypes = {
        article: PropTypes.string,
        state: PropTypes.shape({
            language: PropTypes.shape({
                code: PropTypes.any,
            }),
        }),
    }
    state = {
        data: null,
        description: null,
        selectedMedia: [],
        tabIndex: 0,
        subTabIndex: 0,
    }

    componentWillMount = async (): Promise<void> => {
        await this.refreshData();
    }

    componentWillReceiveProps = async (props: Object): Promise<void> => {
        this.setState({ description: null }, (): Promise<void> => this.refreshData(props));
    }

    refreshData = async (props: Object = this.props): Promise<void> => this.setState({
        data: (await api.instance.request("get", `articles/${props.article}`, "{}"))[0],
        description: null,
    });

    updateDescription = throttle(
        async (): Promise<void> =>
            this.setState({ data: await api.instance.request("put", `articles/${this.props.article}`, JSON.stringify({
                descriptions: [{
                    lng: this.props.state.language.code,
                    description: this.state.description,
                }],
            })) })
        , 2000, { leading: false })

    updateMedia = async (): Promise<void> =>
        this.setState({ data: await api.instance.request("put", `articles/${this.props.article}`, JSON.stringify({
            media: this.state.data.media,
        })) })

    render(): any {
        const { data, description, selectedMedia, mediaInput, tabIndex, subTabIndex } = this.state;
        const lng = this.props.state.language.code;
        const { slugs, names, descriptions, _id } = data || { names: [{ name: "Loading..." }], descriptions: [{ description: "Loading..." }], slugs: [{ slug: "Loading..." }] };

        const activeName = names.find((set: Object): bool => set.lng === lng) || names[0];
        const activeDescription = descriptions.find((set: Object): bool => set.lng === lng) || descriptions[0];
        const activeSlug = slugs.find((set: Object): bool => set.lng === lng) || slugs[0];

        return (<span>
            {data
                ? <div>
                    <h1>Editing post named: {activeName.name}</h1>
                    <Tabs index={tabIndex} onChange={(index: Number): void => this.setState({ tabIndex: index })}>
                        <Tab label="Content">
                            <div className={style.editor}>
                                <div>
                                    <Input
                                        value={description != null ? description : activeDescription.description}
                                        onChange={(_description: String): void => this.setState({ description: _description }, this.updateDescription)}
                                        label="Description"
                                        hint="I will describe how the disease works. Supports Markdown"
                                        multiline
                                    />
                                </div>
                                <div dangerouslySetInnerHTML={{ __html: marked(description != null ? description : activeDescription.description) }}></div>
                            </div>
                        </Tab>
                        <Tab label="Media">
                            <Table
                                model={{
                                    link: { type: String },
                                    preview: { type: String },
                                }}
                                source={data.media.map((link: String): Object => ({ link, preview: <img src={link} alt="Preview" className={style.preview} /> }))}
                                selectable
                                multiSelectable
                                selected={selectedMedia}
                                onSelect={(selected: Number[]): void => this.setState({ selectedMedia: selected })}
                            />
                            {selectedMedia.length > 0 && <Button
                                onClick={(): void => this.setState({ data: { ...data, media: data.media.filter((it: String, index: Number): bool => selectedMedia.indexOf(index) < 0) }, selectedMedia: [] }, this.updateMedia)}
                                label="Delete Selected"
                                raised
                                accent
                            />}
                            <hr className={style.break} />
                            <div className={style.inputWrapper}>
                                <Input
                                    className={style.input}
                                    value={mediaInput || ""}
                                    onChange={(input: String): void => this.setState({ mediaInput: input })}
                                    label="New Media"
                                    hint="http://lorempixel.com/400/400"
                                />
                                <Button
                                    label="Add"
                                    className={style.button}
                                    onClick={(): void => this.setState({ data: { ...data, media: data.media.concat([mediaInput]) }, mediaInput: "" }, this.updateMedia)}
                                    raised
                                    primary
                                    disabled={!(mediaInput && mediaInput.length > 0)}
                                />
                            </div>
                        </Tab>
                        <Tab label="Evaluation and Entertainment">
                            <h1> Pick a category</h1>
                            <Tabs index={subTabIndex} onChange={(index: Number): void => this.setState({ subTabIndex: index })}>
                                <Tab label="Multiple choice questions">
                                    <QuestionsEditor article={activeSlug.slug} articleId={_id} />
                                </Tab>
                                <Tab label="Fill-in-the-blank questions">
                                    <MissingWordsEditor article={activeSlug.slug} articleId={_id} />
                                </Tab>
                                <Tab label="Matching objects questions">
                                    <MatchObjectsComponent article={activeSlug.slug} articleId={_id} />
                                </Tab>
                                {/* <Tab label="Reversed words">
                                    <ReversedWordsEditor article={activeSlug.slug} articleId={_id} />
                                </Tab> */}
                                <Tab label="Puzzle">
                                    <PuzzlesEditor article={activeSlug.slug} articleId={_id} />
                                </Tab>
                            </Tabs>
                        </Tab>
                    </Tabs>
                </div>
                : <h1>Loading...</h1>
            }
        </span>);
    }
}

@injectState(["language.code"])
export class BackButton extends Component {
    static propTypes = {
        article: PropTypes.string,
        onClick: PropTypes.func,
    }

    state = {
        data: null,
    }
    componentWillMount() {
        this.updateData(this.props);
    }

    componentWillReceiveProps(props: Object) {
        if (this.props.article !== props.article) {
            this.updateData(props);
        }
    }

    updateData = async (props: Object): Promise<void> => this.setState({ data: (await api.instance.request("get", `articles/${props.article}`, "{}"))[0] })
    render = (): any => (<li className={navStyle.item} {...(this.state.data ? { onClick: this.props.onClick.bind(null, this.state.data.parent || "null") } : {})}>
        <h1 className={navStyle.view}>{!this.state.data
            ? <span>Loading...</span>
            : <span><span className={"mdi mdi-chevron-left"}></span>{(this.state.data.names.find((it: Object): bool => it.lng === this.props.state.language.code) || this.state.data.names[0]).name}</span>
        }</h1>
    </li>);
}

export default class ContentController extends Component {
    state = {
        activeArticle: "null",
    }

    render(): any {
        const { activeArticle } = this.state;
        return (<div className={style.container}>
            <div className={style.nav}>
                {activeArticle !== "null" && <BackButton article={activeArticle} onClick={(article: string): void => this.setState({ activeArticle: article })} />}
                <NavComponent
                    selectCallback={(article: string): void => this.setState({ activeArticle: article })}
                    apiEndpoint="articles"
                    getApiEndpoint={`articles/parent/${activeArticle}`}
                    swapEnabled
                    newItemTemplate={(): Object => ({
                        names: [{ lng: "en_US", name: "New article" }],
                        slugs: [{ lng: "en_US", slug: "new-article" }],
                        descriptions: [{ lng: "en_US", description: "Description of this new article" }],
                        ...(activeArticle !== "null" ? { parent: activeArticle } : {}),
                    })}
                />
            </div>
            <div className={style.content}>
                {activeArticle !== "null" && <ContentEditor article={activeArticle} /> || <h1> Welcome! Please select the anatomic systems </h1>}
            </div>
        </div>);
    }
}
