// @flow

import State from "./state.js";
import React, { Component } from "react";

import { function as isFunction } from "check-types";
import { BehaviorSubject } from "rxjs";

export type ConfigType = {
    host: string,
    port: number,
    prefix: string,
    enableCORS: ?boolean,
    credentials: ?Object,
}

const baseConfig: ConfigType = {
    host: process.env.AC_API_ADDRESS || "localhost",
    port: process.env.AC_API_PORT || 3000,
    prefix: "v1",
    enableCORS: true,
};

const token: BehaviorSubject<?Object> = new BehaviorSubject(null);
export default class ApiService {
    _config = baseConfig;
    constructor(config: ConfigType = {}) {
        this.config = { ...baseConfig, ...config };
        if (localStorage.getItem("facebookId")) {
            const timer = setInterval(() => {
                if (window.FB) {
                    clearInterval(timer);
                    window.FB.login(
                        ({ authResponse }: Object): void => authResponse &&
                            window.FB.api(
                                "/me",
                                { fields: "email,name,picture" },
                                (data: Object): void => this.login({ ...authResponse, ...data })
                            )
                        );
                }
            }, 500);
        }
    }
    fetch = (url: string, options: Object = {}): Promise<Response> => fetch(
        `//${this.config.host}${this.config.port ? `:${this.config.port}` : ""}${this.config.prefix ? `/${this.config.prefix}` : ""}/${url}`,
        {
            ...options,
            headers: {
                "content-type": "application/json",
                ...options.headers,
                ...(token.getValue() ? { authorization: `Bearer ${token.getValue().token}` } : {}),
            },
            ...(this.config.enableCORS ? { mode: "cors" } : {}),
        }
    )

    login = (facebookData: Object): void => this.post(`users/${facebookData.email}/authenticate/facebook`, {
        body: JSON.stringify({ access_token: facebookData.accessToken, id: facebookData.id }),
        headers: {
            "content-type": "application/json",
        },
    }).then((data: any): Object => data.json()).then(async (data: Object): Promise<void> => {
        localStorage.setItem("facebookId", facebookData.id);
        token.next(data);
        const userData = await this.get("users/me").then((accountData: Object): Object => accountData.json());
        this.userData.next({
            name: facebookData.name,
            picture: facebookData.picture.data.url,
            userData,
        });
    })
    logout = () => {
        window.FB.logout(() => {
            token.next(null);
            localStorage.removeItem("facebookId");
            this.userData.next(null);
        });
    }

    get = (url: string, options: Object = {}): Promise<Response> => this.fetch(url, { ...options, method: "GET" })
    post = (url: string, options: Object = {}): Promise<Response> => this.fetch(url, { ...options, method: "POST" })
    put = (url: string, options: Object = {}): Promise<Response> => this.fetch(url, { ...options, method: "PUT" })
    delete = (url: string, options: Object = {}): Promise<Response> => this.fetch(url, { ...options, method: "DELTE" })

    userData: BehaviorSubject<?Object> = new BehaviorSubject(null);

    static _instance;
    static getInstance(): ApiService {
        if (!this._instance) {
            this._instance = new ApiService();
        }
        return this._instance;
    }
}

export const injectLoginState = (ComposedComponent: Component): Component =>
    class LoginStateWrapper extends Component {
        state = {
            userData: ApiService.getInstance().userData.getValue(),
        }
        componentWillMount() {
            this.$$userData = ApiService.getInstance().userData;
            this.$userData = ApiService.getInstance().userData.subscribe((userData: bool): void => this.setState({ userData }));
        }
        componentWillUnmount() {
            this.$userData.unsubscribe();
        }
        render = (): Component => <ComposedComponent {...this.props} {...this.state} />
    };

type HookRequestParameterObjectType = {
    name: string,
    request: { path: string, options: Object }|string,
    refreshInterval: ?number,
    createRefreshFunction: ?bool
};
type HookRequestParameterType = Function<HookRequestParameterObjectType>|HookRequestParameterObjectType|string;

const propNameFromPath = (prop: string): string => prop.replace(/\//, ".");
const propsWithFunctions = (props: HookRequestParameterType[]): HookRequestParameterType[] =>
    props.filter((prop: HookRequestParameterType): boolean => isFunction(prop));

export const hookRequest = (
        properties: HookRequestParameterType[],
        autoUpdate: number|boolean = false,
        refreshInterval: number|boolean = 5000,
    ): Function =>
    (ComposedComponent: Component): Component =>
        class APIWrapper extends Component {
            state = {
                states: {},
                refreshFunctions: {},
            }
            componentWillMount = () => {
                this.propsWithFunctions = propsWithFunctions(properties);
                this.refreshHandlers(this.props);
            }
            componentWillUnmount = () => {
                this.timers.map(clearInterval);
            }
            componentWillReceiveProps = (props: Object) => {
                if (propsWithFunctions.length > 0) {
                    this.refreshHandlers(props);
                }
                if (autoUpdate === true) {
                    this.updateAll();
                }
            }
            refreshHandlers = (props: Object) => {
                // Cleanup
                this.timers.map(clearInterval);
                this.timers = [];
                Object.keys(this.updaters).map((prop: string): void => delete this.updaters[prop]);
                this.updaters = {};
                this.setState({
                    states: {},
                    refreshFunctions: {},
                }, () => {
                    const api = ApiService.getInstance();
                    const refreshFunctions = {};
                    const states = properties.reduce((prev: Object, property: HookRequestParameterType|string): Object => {
                        let prop = property;
                        if (isFunction(prop)) {
                            prop = prop(props);
                        }
                        if (prop) {
                            const name = prop.name || propNameFromPath(prop);
                            const func = (): Promise<Object> => api
                                .fetch(
                                    prop.request ? (prop.request.path && prop.request.path || prop.request) : prop,
                                    prop.request && prop.request.options && prop.request.options || { method: "GET" }
                                )
                                .then((data: Response): Object => data.json())
                                .then((data: Object): void => this.setState({ states: { ...this.state.states, [name]: data } }) && data)
                                .catch((): void => autoUpdate && setTimeout(func, refreshInterval || 1000));
                            this.updaters[name] = func;
                            if (prop.request && prop.request.createRefreshFunction) {
                                console.log("Creating refresh function for", prop.request);
                                refreshFunctions[`refresh${name[0].toUpperCase()}${name.substr(1)}`] = func;
                            }
                            if (prop.request && prop.request.refreshInterval) {
                                this.timers.push(setInterval(func, prop.request.refreshInterval));
                            }
                            return { ...prev, [name]: null };
                        }
                        return prev;
                    }, {});
                    this.setState({ states, refreshFunctions }, this.updateAll);
                    if (refreshInterval && refreshInterval > 0) {
                        this.timers.push(setInterval(this.updateAll), refreshInterval);
                    }
                });
            }

            updateAll = (): Promise<Object>[] => Object.keys(this.updaters).map((updater: string): void => this.updaters[updater]());
            updaters = {};
            timers = [];

            render = (): Component => (<ComposedComponent
                {...this.props}
                {...this.state.refreshFunctions}
                {...this.state.states}
            />)
        };

State.broadcast("api", ApiService.getInstance());
