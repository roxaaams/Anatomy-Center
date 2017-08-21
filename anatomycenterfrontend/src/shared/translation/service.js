// @flow

/** @module Shared **/

import memoize from "../helpers/memoize";
import StateService from "../services/state";
import moment from "moment";

type LanguageSetType = {
    [key: string]: string
}
type LanguageSetsType = {
    [key: string]: LanguageSetType
}
type ValidSetType = {
    name: string,
    code: ?string,
    flag: string,
    description: string,
    sets: LanguageSetsType
}
type ValidSetsType = {
    [key: string]: ValidSetType
}

let validSetsPrivate: ValidSetsType = {};
const enUsConfig: Object = {
    code: "us_US",
    flag: "us",
    name: "US English",
    description: "Simplified english",
};

/**
 * Memoized function that trims a file name ("./file.extension" => "file")
 * @param  {String} file The string containing the file path
 * @return {String} The trimmed file name
 */
const trimFile = memoize((file: string): string => file.substr(2).replace(/\..*/, ""));

/**
 * Translator Service Class
 */
export default class TranslatorService {

    /**
     * Shorthand to set the default language
     * @static
     * @type {String}
     * @name defaultLanguage
     * @memberof TranslatorService
     * @example
     *console.log(TranslatorService.defaultLanguage); // => "ro_RO"
     */
    static defaultLanguage = "ro_RO";

    /**
     * Generates the correct language translation sets
     * @static
     * @return {ValidSetsType[]} An array containing the valid sets type
     * @memberof TranslatorService
     * @name getValidSets()
     * @example
     *console.log(TranslatorService.getValidSets()) // => { "ro_RO": { ... }, "en_UK": { ... } }
     */
    static getValidSets(ctx: Object | Array<string> | string = "./languages/"): ValidSetsType {
        let keys = [];
        if (ctx.keys) {
            keys = ctx.keys();
        } else if (ctx.substr) {
            keys = require.context(ctx).keys();
        } else {
            keys = ctx;
        }

        validSetsPrivate = keys.reduce((prev: ValidSetsType, file: string): ValidSetType => true &&
            {
                [trimFile(file)]: {
                    code: trimFile(file),
                    ...(ctx(file)),
                },
                ...prev,
            }
        , {});

        return validSetsPrivate;
    }

    /**
     * Memoized version of #getValidSets
     * @static
     * @return {ValidSetsType[]} An array containing the valid sets type
     * @name validSets
     * @memberof TranslatorService
     * @example
     *console.log(TranslatorService.validSets) // => { "ro_RO": { ... }, "en_UK": { ... } }
     */
    static get validSets(): ValidSetsType {
        if (validSetsPrivate) {
            return validSetsPrivate;
        }
        return TranslatorService.getValidSets();
    }

    /**
     * Currently selected language
     * @private
     * @type {string}
     * @name _language
     * @memberof TranslatorService
     */
    _language: string = TranslatorService.defaultLanguage;

    /**
     * Currently selected set
     * @private
     * @type {ValidSetType}
     * @name _set
     * @memberof TranslatorService
     */
    _set: ValidSetType = TranslatorService.validSets[TranslatorService.defaultLanguage];

    /**
     * Creates a new instance of the Translate Service
     * @constructs TranslatorService
     */
    constructor() {
        this.language = localStorage.getItem("lang") || this.language;
    }

    /**
     * Language
     * Setter object will both save the choice in localStorage, as well as broadcast the changes to subscriptions to {@link TranslatorService#subscribe()}
     * @return {String} Language code currently in use (setter propagates changes)
     * @param  {String} lng the language string to be set
     * @name language
     * @instance
     * @memberof TranslatorService
     * @example
     *const i = TranslatorService.instance;
     *console.log(i.language); // => "en_US"
     *
     * // Subscribing to the {@link TranslatorService#subscribe()|broadcast} subject, to catch event changes
     *i.subscribe((lang) => console.log("TRIGGER", lang));
     *i.language = "ro_RO"; // will log `TRIGGER ro_RO`
     *console.log(i.language); // "ro_RO"
     */
    get language(): string {
        return this._language;
    }
    set language(lng: string) {
        if (this.languages.indexOf(lng) >= 0) {
            this._language = lng;
            this._set = TranslatorService.validSets[this._language];
            localStorage.setItem("lang", lng);
            moment.locale(this._language.substr(0, 2));
            ::StateService.broadcast("language.code", this._language);
            ::StateService.broadcast("language.set", this._set);
        }
    }

    /**
     * Language set
     * @return {String} Language information currently in use
     * @name languageInfo
     * @instance
     * @memberof TranslatorService
     * @example
     *const i = TranslatorService.instance;
     *console.log(i.languageInfo) // => { name: "...", description: "...", "sets": { ... } }
     */
    get languageInfo(): ValidSetType {
        return this._set;
    }

    /**
     * Language list
     * @return {String[]} Array containing all available language codes
     * @name languages
     * @instance
     * @memberof TranslatorService
     * @example
     *const i = TranslatorService.instance;
     *console.log(i.languages); // => [ "en_US", "en_UK", "ro_RO" ]
     */
    get languages(): string[] {
        return ["en_US", ...Object.keys(TranslatorService.validSets)];
    }

    get languagesInfo(): Object {
        return {
            en_US: enUsConfig,
            ...TranslatorService.validSets,
        };
    }

    /**
     * Sets Getter
     * @return {LanguageSetType[]} Language translation sets belonging to currently selected set
     * @name sets
     * @instance
     * @memberof TranslatorService
     * @example
     *const i = TranslatorService.instance;
     *console.log(i.sets); // => { main: { ... },  admin: { ... }, nav: { ... }, ... }
     */
    get sets(): LanguageSetType {
        if (!this._language) {
            return null;
        }
        if (!this._set) {
            this._set = TranslatorService.validSets[this._language];
        }
        return this._set && this._set.sets;
    }

    /**
     * Singleton Instance (private)
     * @private
     * @static
     * @type {TranslatorService}
     * @name _instance
     * @memberof TranslatorService
     */
    static _instance: ?TranslatorService;

    /**
     * Singleton Instance
     * @static
     * @return {TranslatorService} The singleton instance
     * @name instance
     * @memberof TranslatorService
     * @example
     *
     *import { TranslatorService as Service } from "./service";
     *console.log(Service.instance) // => Instance
     */
    static get instance(): TranslatorService {
        if (!this._instance) {
            this._instance = new this();
        }
        return this._instance;
    }
}
