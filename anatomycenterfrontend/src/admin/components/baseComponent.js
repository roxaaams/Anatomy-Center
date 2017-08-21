import React from "react";
import { bindAll } from "../../shared/helpers/util";


/**
 * Extend a new lazy loading property onto an object
 * NOTE: File name will be pluralized (adding an "s" to the end)
 * @param  {Object} owner Object to which the property will be loaded
 * @param  {String} file The file (/property) to be loaded
 * @param  {Function} req Webpack require context to be used when importing
 * @param  {Boolean} bind Flag to signify if file should be bound or only required once
 * @return {Void} Will not return anything
 */
const _extend = (owner: any, file: string, req: Function, bind : boolean = true) => {
    const prop = `${file}s`;
    try {
        Object.defineProperty(owner, prop, {
            get: (): any => bind && bindAll(owner, req(`./${file}`)) || req(`./${file}`),
        });
    } catch (e) {
        console.warn(`Couldn't load ${file[0].toUpperCase()}${file.substr(1)}s for "${owner.name || owner.displayName || owner.toString()}"`, e);
    }
};

/**
 * Base Component class
 * (makes lazy loading of views and styles from separate files, binding scope to current Component)
 */
export default class EnhancedComponent extends React.Component {

    /**
    * Constructor requires a webpack require isntance to infer context and lazy load view.* and style.*
     * @param  {Function} ctx The webpack require instance
     * @return {EnhancedComponent} being a constructor, return the new instance
     */
    constructor(ctx: Function = require, ...args: any[]) {
        super(...args);
        _extend(this, "view", ctx);
        _extend(this, "style", ctx, false);
    }

    /**
     * Render stub (will render "Loading..." if no view function overloads this)
     * @return {React.Component} Returns a React Component, ready for rendering
     */
    render(): React.Component {
        return (this.views && this.views.render && this.views.render()) || <span>Loading...</span>;
    }
}
