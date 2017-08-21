import jQuery from "jquery";

const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const ARGUMENT_NAMES = /([^\s,]+)/g;

class Util {

    // TODO: Refractor the actions and reducer functions
    // Can be a lot more useful if they're refractored and abstracted to be used by both actions and reducers

    static getFiles(cb: Function) {
        jQuery.get(`${Util.suffixSlash(window.location)}files`, cb);
    }
    static getDescription(cb: Function, item : string = `${window.location}/readme.md`) {
        jQuery.get(item, cb);
    }
    static suffixSlash(str: string): string {
        const _str = `${str}`;
        return _str[_str.length - 1] === "/" ? _str : `${_str}/`;
    }

    static *entries(obj: Object) {
        for (const key: string of Object.keys(obj)) {
            yield [key, obj[key]];
        }
    }

    static reflection(func: Function): string {
        const fnStr = func.toString().replace(STRIP_COMMENTS, "");
        let result = fnStr.slice(fnStr.indexOf("(") + 1, fnStr.indexOf(")")).match(ARGUMENT_NAMES);
        if (result === null) { result = []; }
        return result;
    }

    static bindAll(owner: Object, o: Object): Object {
        const keys = Object.getOwnPropertyNames(o);
        const ret = {};
        for (const k of keys) {
            const descriptor = Object.getOwnPropertyDescriptor(o, k);
            const newdesc = {};
            if (descriptor.value != null && (typeof descriptor.value.apply) !== "undefined") {
                newdesc.value = descriptor.value.bind(owner);
            }
            if ((typeof descriptor.get) !== "undefined") {
                newdesc.get = descriptor.get.bind(owner);
            }
            if ((typeof descriptor.set) !== "undefined") {
                newdesc.set = descriptor.set.bind(owner);
            }
            Object.defineProperty(ret, k, newdesc);
        }
        return ret;
    }

    static extend(dest: Object, ...args: any[]): Object {
        const excl = ["$scope", "constructor"];
        const l = args.length;
        const _dest = dest;
        if (l < 1 && _dest == null) {
            return _dest;
        }
        for (let o of args) {
            let hasDescriptor = false;
            let bindMode;
            let owner;
            let shouldBind = true;
            let useSelfbind = false;
            if ((typeof o.isBindingDescriptor) !== "undefined" && (typeof o.object) !== "undefined") {
                hasDescriptor = true; bindMode = o.bind_mode || false; owner = o.owner || null; shouldBind = o.bind !== undefined ? o.bind : shouldBind; useSelfbind = o.useSelfbind || o.selfbind || useSelfbind; o = o.object;
            }
            const keys = Object.getOwnPropertyNames(o);
            for (const k of keys) {
                if (excl.indexOf(k) < 0) {
                    try {
                        if (hasDescriptor) {
                            if (owner != null) {
                                if (bindMode === true || bindMode === "direct") {
                                    _dest[k] = o[k].bind(owner);
                                } else {
                                    if (bindMode === "descriptor") {
                                        try {
                                            const descriptor = Object.getOwnPropertyDescriptor(o, k);
                                            let val = null;
                                            let get = null;
                                            let set = null;
                                            if (descriptor.value != null && (typeof descriptor.value.apply) !== "undefined") {
                                                if (useSelfbind) {
                                                    val = descriptor.value;
                                                    delete descriptor.value;
                                                } else {
                                                    descriptor.value = descriptor.value.bind(owner);
                                                }
                                            }
                                            if ((typeof descriptor.get) !== "undefined") {
                                                if (useSelfbind) {
                                                    get = descriptor.get;
                                                    delete descriptor.get;
                                                } else {
                                                    descriptor.get = descriptor.get.bind(owner);
                                                }
                                            }

                                            if ((typeof descriptor.set) !== "undefined") {
                                                if (useSelfbind) {
                                                    set = descriptor.set;
                                                    delete descriptor.set;
                                                } else {
                                                    descriptor.set = descriptor.set.bind(owner);
                                                }
                                            }
                                            if (useSelfbind) {
                                                delete descriptor.writable;
                                                descriptor.get = function getter() {
                                                    const obj = {
                                                        configurable: true,
                                                        writable: true,
                                                    };
                                                    if (val !== null) {
                                                        const bound = val.bind(owner);
                                                        obj.value = bound;
                                                    }
                                                    if (get !== null) {
                                                        const bound = get.bind(owner);
                                                        obj.get = bound;
                                                    }
                                                    if (set !== null) {
                                                        const bound = set.bind(owner);
                                                        obj.set = bound;
                                                    }
                                                    Object.defineProperty(_dest, k, obj);
                                                };
                                            }
                                            Object.defineProperty(_dest, k, descriptor);
                                        } catch (e) {
                                            console.log("ERROR", e);
                                            throw e;
                                        }
                                    }
                                }
                            } else {
                                if (bindMode === "descriptor") {
                                    const descriptor = Object.getOwnPropertyDescriptor(o, k);
                                    let val = null;
                                    let get = null;
                                    let set = null;
                                    if (descriptor.value != null && (typeof descriptor.value.apply) !== "undefined") {
                                        if (useSelfbind) {
                                            val = descriptor.value;
                                            delete descriptor.value;
                                        } else {
                                            descriptor.value = descriptor.value;
                                        }
                                    }
                                    if ((typeof descriptor.get) !== "undefined") {
                                        if (useSelfbind) {
                                            get = descriptor.get;
                                            delete descriptor.get;
                                        } else {
                                            descriptor.get = descriptor.get;
                                        }
                                    }

                                    if ((typeof descriptor.set) !== "undefined") {
                                        if (useSelfbind) {
                                            set = descriptor.set;
                                            delete descriptor.set;
                                        } else {
                                            descriptor.set = descriptor.set;
                                        }
                                    }
                                    if (useSelfbind) {
                                        delete descriptor.writable;
                                        descriptor.get = function getFunc() {
                                            const obj = {
                                                configurable: true,
                                                writable: true,
                                            };
                                            if (val !== null) {
                                                const bound = val.bind(this);
                                                obj.value = bound;
                                            }
                                            if (get !== null) {
                                                const bound = get.bind(this);
                                                obj.get = bound;
                                            }
                                            if (set !== null) {
                                                const bound = set.bind(this);
                                                obj.set = bound;
                                            }
                                            Object.defineProperty(this, k, obj);
                                        };
                                    }
                                    Object.defineProperty(_dest, k, descriptor);
                                } else {
                                    _dest[k] = o[k];
                                }
                            }
                        } else { _dest[k] = o[k]; }
                    } catch (e) {
                        continue;
                    }
                }
            }
        }
        return _dest;
    }

    static uuid(): string {
        function s4(): string {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
    }

    static stringToUrl(str: string): string {
        return str.toLowerCase().replace(/ /g, "-");
    }

    static limitString(str: string, len: number): string {
        const s = str.substr(0, len);
        return s.substr(0, s.lastIndexOf(" "));
    }
}

export default Util;
