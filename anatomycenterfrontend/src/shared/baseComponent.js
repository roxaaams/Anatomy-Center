import React from "react";
import { bindAll } from "./helpers/util";

const _extend = (owner: any, file: string, req: Function, bind : boolean = true) => {
    const prop = `${file}s`;
    try {
        Object.defineProperty(owner, prop, {
            get: () : any => bind && bindAll(owner, req(`./${file}`)) || req(`./${file}`),
        });
    } catch (e) {
        console.warn(`Couldn't load ${file[0].toUpperCase()}${file.substr(1)}s for "${owner.name || owner.displayName || owner.toString()}"`, e);
    }
};

export default class EnhancedComponent extends React.Component {
    constructor(ctx : Function = require, ...args: any[]) {
        super(...args);
        _extend(this, "view", ctx);
        _extend(this, "style", ctx, false);
    }

    componentWillUnmount() {
        this.__unmounted = true;
    }

    __unmounted: boolean = false;

    render(): any {
        return (this.views && this.views.render && this.views.render()) || <span>Loading...</span>;
    }
}
