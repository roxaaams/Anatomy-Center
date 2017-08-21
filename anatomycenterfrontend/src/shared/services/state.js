// @flow

import React, { Component, PropTypes } from "react";
import { BehaviorSubject, Subscription } from "rxjs";

import { initializeObject, findObject } from "../helpers/objectTools";

import { mergeWith, isArray } from "lodash";

import db from "./DB";
const config = [];

export type SubscriptionValueType = { _id: string, value: any };

const createSaveFunction = (path: string): Function =>
    async (val: any): Promise<SubscriptionValueType> => {
        let obj: SubscriptionValueType;

        try {
            obj = await db.get(path);
        } catch (e) {
            obj = { _id: path, value: null };
        }

        obj.value = val;
        try {
            await db.put(obj);
        } catch (e) {
            console.log("Could not save to db", obj, e);
        }

        return obj;
    };

const getInitialData = async (path: string, initial: any): Promise<any> => {
    try {
        const obj = await db.get(path);
        console.log("GET OBJ", path, obj.value);
        return obj.value;
    } catch (e) {
        return initial;
    }
};

export default class StateMachine {
    static state = {}
    static state: {
        [string]: Object|BehaviorSubject<any>,
    }

    static subscribe(path: string, {
            handler,
            errHandler,
            completeHandler,
            initial,
            autosave,
        }: any): Subscription {
        const subject = this.reuse(path, initial);
        const sub = subject.subscribe(handler, errHandler, completeHandler);
        if (autosave) {
            const savesub = subject.subscribe(createSaveFunction(path));

            getInitialData(path, initial).then((init: any): void => subject.next(init));

            return {
                unsubscribe: () => {
                    sub.unsubscribe();
                    savesub.unsubscribe();
                },
            };
        }
        return sub;
    }

    static broadcast(path: string, data: any) {
        console.log("BROADCAST", path, data);
        this.reuse(path).next(data);
    }

    static reuse(path: string, initialValue: any = null): BehaviorSubject<any> {
        this.state = initializeObject(this.state, path, (): BehaviorSubject<any> => new BehaviorSubject(initialValue));
        return findObject(this.state, path);
    }

    static async init(): Promise<void> {
        await Promise.all(config.map(async ({ path, init, autosave }: Object): Promise<void> => {
            const subject = this.reuse(path, init);

            const save = createSaveFunction(path);

            let _init = init;
            if (autosave) {
                subject.subscribe(save);
                _init = await getInitialData(path, init);
            }

            subject.next((await save(_init)).value);
            return null;
        }));
    }
}

export type InitPropType = {
    name: string,
    value: any,
    autosave: ?bool,
}

export const injectState = (_props: Array<Function|string|InitPropType>, bindFunctionMethods: bool = false): Function =>
    (DecoratedComponent: any): any =>
        class StateWrapperComponent extends Component {
            static propTypes = {
                state: PropTypes.object,
            }

            state = initializeObject({}, _props)

            subscriptions = []
            componentWillMount() {
                this.subscriptions = _props.map(
                    (prop: string|InitPropType): Subscription =>
                        ((p: string, v: any, autosave: ?bool): Subscription =>
                            StateMachine.subscribe(p, {
                                handler: (value: any): void => this.setState(mergeWith(
                                    this.state,
                                    initializeObject({}, p, value),
                                    (objValue: any, srcValue: any): any =>
                                        isArray(objValue) && srcValue || undefined
                                )),
                                ...((typeof v) !== "undefined" ? { initial: v } : {}),
                                ...({ autosave }),
                            })
                    )(...(typeof(prop.substr) !== "undefined" && [prop] || (
                        typeof(prop.apply) !== "undefined" && [prop(this.props)]
                        || [prop.name, prop.value, prop.autosave]
                    )))
                );
            }

            componentWillUnmount() {
                this.subscriptions.forEach((sub: Subscription): void => sub.unsubscribe());
            }

            render(): any {
                const { props, state } = this;
                return (<DecoratedComponent
                    {...props}
                    setStateItem={::StateMachine.broadcast}
                    {...(bindFunctionMethods ? _props.reduce((prev: Object, it: string|InitPropType): Object => ({
                        ...prev,
                        ...(((str: string): Object => ({
                            [`set${str[0].toUpperCase()}${str.substr(1).replace(/\.([a-zA-Z])/g, (match: string, $1: string): string => $1.toUpperCase())}`]: StateMachine.broadcast.bind(StateMachine, str),
                        }))(it.name ? it.name : it)),
                    }), {}) : {})}
                    state={Object.assign({}, this.props.state, state)}
                />);
            }
        };
