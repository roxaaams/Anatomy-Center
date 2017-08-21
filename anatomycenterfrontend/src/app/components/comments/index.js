// @flow

import ApiService, { hookRequest, injectLoginState } from "../../../shared/services/api.js";

import { Link } from "react-router-dom";
import Moment from "react-moment";

import React, { Component, PropTypes } from "react";
import style from "./style.sass";
import marked from "marked";

import { Card, CardText, CardTitle } from "react-toolbox/lib/card";
import { Input } from "react-toolbox/lib/input";
import { Button } from "react-toolbox/lib/button";
import { installLanguageSets } from "../../../shared/translation/decorators.js";

@installLanguageSets("comments", "general")
@injectLoginState
@hookRequest([({ id }: Object): Object => ({
    name: "list",
    request: {
        path: `topic/${id}/comments`,
        createRefreshFunction: true,
    },
})], false, false)
export default class Comments extends Component {
    static propTypes = {
        id: PropTypes.string,
        list: PropTypes.arrayOf(PropTypes.object),
        userData: PropTypes.object,
        refreshList: PropTypes.func,
        translate: PropTypes.func,
    }
    state = {
        input: "",
    }
    sendComment = () => {
        ApiService.getInstance().post(`comments`, {
            body: JSON.stringify({ belongsTo: this.props.id, comment: this.state.input }),
        }).then(this.props.refreshList);
        this.setState({ input: "" });
    }
    render = (): any => (<section className={style.comments}>
        <article className={style.list}>
            {this.props.list && this.props.list.length > 0
                ? this.props.list.map((comment: Object): Object => <Card className={[style.comment, this.props.userData && comment.postedBy && comment.postedBy._id === this.props.userData.userData._id && style.own].join(" ")}>
                    <CardTitle
                        title={<span>
                            {this.props.translate("Posted by")} {comment.postedBy ? <Link to={`/user/${comment.postedBy.email}`}>{comment.postedBy.name}</Link> : <span>Unknown</span>}
                        </span>}
                        subtitle={<Moment fromNow>{comment.date}</Moment>}
                    />
                    <CardText>
                        <div dangerouslySetInnerHTML={{ __html: marked(comment.comment) }} className={style.text} />
                    </CardText>
                </Card>)
                : <h1 className={style.notFoundBar}>
                    <div className={style.position}>
                        <span>{this.props.translate("There are no comments yet")}!</span>
                    </div>
                </h1>
            }
        </article>
        {this.props.userData && <aside className={style.aside}>
            <div className={style.preview} dangerouslySetInnerHTML={{ __html: marked(this.state.input) }} />
            <div className={style.inputGroup}>
                <Input
                    label={this.props.translate("New Comment")}
                    value={this.state.input}
                    className={style.input}
                    onChange={(input: string): void => this.setState({ input })}
                    onKeyUp={({ keyCode }: Object): void => keyCode === 13 && this.sendComment()}
                    multiline
                />
                {this.state.input.length > 0 && <Button
                    label="Submit"
                    onClick={this.sendComment}
                />}
            </div>
        </aside>}
    </section>)
}
