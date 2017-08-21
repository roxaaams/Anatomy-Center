import React, { Component } from "react";
import { hookRequest } from "../../../shared/services/api.js";
import md5 from "md5";

import { Tab, Tabs } from "react-toolbox/lib/tabs";
import QuestionPreview from "../previews/question.js";
import CommentPreview from "../previews/comment.js";

import style from "./style.sass";
import config from "../../config/users.js";

@hookRequest([({ match: { params: { id } } }: Object): Object => ({
    name: "user",
    request: `users/${id}/full`,
}), ({ match: { params: { id } } }: Object): Object => ({
    name: "comments",
    request: `users/${id}/comments`,
})], false, false)
export default class UserComponent extends Component {
    state = {
        activeTab: 0,
    }
    render = (): Component => {
        const { user, comments, history } = this.props;
        const rank = user && config.tiers.reduce((prev: number, it: number, index: number): number => ((user.score || 0) > it ? index : prev), -1);
        return (<section className={[style.container, style.noflex, style.padded].join(" ")}>
            {user
                ? <div className={style.wrapper}>
                    <header className={style.header}>
                        <img src={user.picture || `http://gravatar.com/avatar/${md5(user.email)}`} alt="Avatar" />
                        <div className={style.titles}>
                            <h1>{user.name} <span>{user.score}</span></h1>
                            <h2>Reached Rank {rank + 2}</h2>
                        </div>
                        {rank > config.tiers.length - 4 && <img className={style.badge} src={`/assets/${rank > config.tiers.length - 2 && "gold" || rank > config.tiers.length - 3 && "silver" || "bronze"}.png`} alt="Badge" />}
                    </header>
                    <section className={style.list}>
                        <Tabs index={this.state.activeTab} onChange={(activeTab: number): void => this.setState({ activeTab })} className={style.tabs}>
                            <Tab label="Questions">
                                {user.completed && user.completed.length
                                    ? <div className={style.list}>
                                        {user.completed.map(({ completed, at }: Object): Component => <div className={style.item}>
                                            {completed.__t === "Question" && <QuestionPreview question={completed} at={at} />}
                                        </div>)}
                                    </div>
                                    : <h1 className={style.notFoundBar}>
                                        <div className={style.position}>
                                            <span>This user has not answered any questions</span>
                                        </div>
                                    </h1>}
                            </Tab>
                            <Tab label="Comments">
                                {comments && comments.length
                                    ? <div className={style.list}>
                                        {comments.map((comment: Object): Component => (<div className={style.item}>
                                            <CommentPreview comment={comment} history={history} showOwner={false} />
                                        </div>))}
                                    </div>
                                    : <h1 className={style.notFoundBar}>
                                        <div className={style.position}>
                                            <span>This user has not answered any questions</span>
                                        </div>
                                    </h1>
                                }
                            </Tab>
                        </Tabs>
                    </section>
                </div>
                : <h1>Loading Account...</h1>
            }
        </section>);
    }
}
