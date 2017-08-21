import $ from "jquery";
import cfg from "config"; // eslint-disable-line
import { BehaviorSubject } from "rxjs";
import React, { Component } from "react";

window.jQuery = $;

export default class AuthService {

    _token: string = null;
    subject: BehaviorSubject = new BehaviorSubject();
    get token(): string {
        return this._token || localStorage.getItem("access_token") || null;
    }
    set token(token: ?string) {
        this._token = token;
        if (token) {
            localStorage.setItem("access_token", token);
        } else {
            localStorage.removeItem("access_token");
        }
        this.subject.next({ authToken: token });
    }

    valid: boolean = false;
    constructor() {
        try {
            this.checkToken();
        } finally {
            console.log("done");
        }
    }

    async checkToken(): ?Object {
        if (this.token) {
            let data = null;
            let err = null;

            try {
                data = await this.request("get", "users/check.token", "{}");
            } catch (e) {
                err = e;
            }

            if (data && data.valid) {
                return data;
            }

            this.token = null;
            throw err || new Error("No Valid Token");
        }
        throw new Error("No Token");
    }

    async login(email: string, password: string): Promise {
        let shouldLogin = false;

        if (this.token) {
            try {
                return await this.checkToken();
            } catch (e) {
                shouldLogin = true;
            }
        } else {
            shouldLogin = true;
        }

        if (shouldLogin) {
            if (!email || !password) {
                throw new Error(`No ${[(!email && "email"), (!password && "password")].join(", ")} present.`);
            }
            const t = await this.request("post", `users/${email}/authenticate`, JSON.stringify({ password }), false);
            this.token = t.token;
            return t;
        }
        throw new Error(`Already logged in!`);
    }

    async logout(): Promise {
        if (this.token) {
            await this.request("post", `users/me/logout`, "{}");
            this.token = null;
        }
        return null;
    }

    static _instance: AuthService;
    static get instance(): AuthService {
        if (!this._instance) {
            this._instance = new this();
        }
        return this._instance;
    }

    async request(method: string = "get", endpoint: string = "/", data: Object = {}, useHeaders: boolean = true): Promise {
        console.log("preflight", this.token, useHeaders, method, endpoint);
        const headers = (this.token && useHeaders && {
            authorization: `Bearer ${this.token}`,
        } || {});
        return new Promise((accept: Function, reject: Function): void =>
            $.ajax({
                url: `${cfg.api}/v1/${endpoint}`,
                type: "json",
                dataType: "json",
                contentType: "application/json",
                method,
                data,
                headers,
                processData: false,
            }).done(accept).catch(reject)
        );
    }
}

class AuthDirective extends Component {
    state = {
        authToken: AuthService.instance.token,
    }

    componentWillMount() {
        this._subscription = AuthService.instance.subject.subscribe(
            (token: Object): void => (console.log("token trigger", token) || true) && token && ::this.setState(token)
        );
    }
    componentWillUnmount() {
        if (this._subscription) {
            this._subscription.unsubscribe();
        }
    }
    _subscription: BehaviorSubject;
}

export const installAuthActions: Function = (ComposedComponent: Component): Component =>
    (props: any[]): Component => <ComposedComponent
        {...props}
        authActions={{
            login: ::AuthService.instance.login,
            logout: ::AuthService.instance.logout,
        }}
    />;

export const installAuthToken: Function = (ComposedComponent: Component): Component =>
    class extends AuthDirective {
        state = {
            authToken: AuthService.instance.token,
        }
        render(): Component {
            return <ComposedComponent {...this.props} authToken={this.state.authToken} authSubject={AuthService.instance.subject} />;
        }
    };

export const ifLoggedIn: Function = (ComposedComponent: Component): Component =>
    class extends AuthDirective {
        state = {
            authToken: AuthService.instance.token,
        }
        render(): Component {
            if (this.state.authToken) {
                return <ComposedComponent {...this.props} authToken={this.state.authToken} />;
            }
            return <span />;
        }
    };

export const ifNotLoggedIn: Function = (ComposedComponent: Component): Component =>
    class extends AuthDirective {
        state = {
            authToken: AuthService.instance.token,
        }
        render(): Component {
            if (!this.state.authToken) {
                return <ComposedComponent {...this.props} authToken={this.state.authToken} />;
            }
            return <span />;
        }
    };
