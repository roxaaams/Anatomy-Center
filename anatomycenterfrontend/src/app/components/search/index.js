import React, { Component, PropTypes } from "react";
import style from "./style.sass";

import Article from "../previews/article.js";
import Question from "../previews/question.js";
import User from "../previews/user.js";
import Comment from "../previews/comment.js";

import Comments from "../comments/index.js";

import { Tab, Tabs } from "react-toolbox/lib/tabs";

import { hookRequest } from "../../../shared/services/api";
import { installLanguageSets } from "../../../shared/translation/decorators.js";

@installLanguageSets("search", "content")
@hookRequest([({ topic }: Object): Object => ({
    name: "results",
    request: `search/${topic}`,
})], false, false)
export default class SearchComponent extends Component {
    static propTypes = {
        topic: PropTypes.string,
        results: PropTypes.arrayOf(PropTypes.object),
        history: PropTypes.object,
        translate: PropTypes.func,
    }
    state = {
        activeTab: 0,
    }
    render = (): Component => {
        const { topic, results, history, translate } = this.props;
        return (<section className={[style.container, style.padded, style.wrapper].join(" ")}>
            <h1 className={style.title}>{translate("Searching for")} {topic}</h1>
            <Tabs index={this.state.activeTab} onChange={(activeTab: number): void => this.setState({ activeTab })} className={style.tabs}>
                <Tab label={translate("Results")}>
                    {results && results.length > 0
                        ? <div className={style.list}>
                            {results.map((result: Object): Component =>
                                result.type === "article" && <div className={style.article}>
                                    <Article article={result.data} history={history} />
                                </div>
                                || result.type === "user" && <div className={style.user}>
                                    <User user={result.data} history={history} />
                                </div>
                                || result.type === "question" && <div className={style.question}>
                                    <Question question={result.data} history={history} />
                                </div>
                                || result.type === "comment" && <div className={style.comment}>
                                    <Comment comment={result.data} history={history} showOwner />
                                </div>)
                            }
                        </div>
                        : <h1 className={style.notFoundBar}>
                            <div className={style.position}>
                                <span>{translate("There was nothing found matching")} "{topic}"</span>
                            </div>
                        </h1>}
                </Tab>
                <Tab label={translate("Discussion")}>
                    <Comments id={topic} />
                </Tab>
            </Tabs>
        </section>);
    }
}
