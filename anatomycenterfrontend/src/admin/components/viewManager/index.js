// @flow

import React, { Component, PropTypes } from "react";
import md5 from "md5";

import { installAuthToken, ifLoggedIn, installAuthActions, Service as api } from "../auth";
import { Component as LanguageSelect } from "translation"; // eslint-disable-line

import { injectState } from "shared/services/state"; // eslint-disable-line

import UsersController from "./users";
import ContentController from "./content";

import style from "./style"; //eslint-disable-line


const controllerMap = {
    content: <ContentController />,
    users: <UsersController />,
};

@installAuthToken
@installAuthActions
@ifLoggedIn
export default class ViewManagerComponent extends Component {
    static propTypes = {
        authActions: PropTypes.shape({
            logout: PropTypes.func,
        }),
    }

    state = {
        activeView: "content",
        user: null,
    }

    componentWillMount = async (): Promise<void> => {
        this.setState({ user: await api.instance.request("get", "users/me", "{}") });
    }

    navMenu(): any {
        const { user } = this.state;
        return (<nav className={style.nav}>
            <h1>{user != null
                ? <div className={style.user}>
                    <div className={style.img}>
                        <img src={`//www.gravatar.com/avatar/${md5(user.email)}`} alt="gravatar" />
                    </div>
                    <div className={style.text}>{user.name}</div>
                </div>
                : "AnatomyCenter"
            }</h1>
            <nav>
                <li onClick={this.props.authActions.logout}>Logout</li>
                <li onClick={this.setState.bind(this, { activeView: "users" })}>Users</li>
                <li onClick={this.setState.bind(this, { activeView: "content" })}>Content</li>
            </nav>
            <div>
                <LanguageSelect />
            </div>
        </nav>);
    }

    render(): any {
        return (<div className={style.container}>
            {this.navMenu()}
            <div className={style.content}>
                {controllerMap[this.state.activeView]}
            </div>
        </div>);
    }

}
