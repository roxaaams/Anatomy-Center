
const Memos = new WeakMap();
const initMemo = (method: Function): any => {
    if (!Memos.has(method)) {
        Memos.set(method, new Map());
    }
    return Memos.get(method);
};

const refresh = (method: Function): any => {
    const map = initMemo(method);
    return (...args: any[]): any => {
        const _ret = method(...args);
        const _args = JSON.stringify(args);
        map.set(_args, _ret);
        return _ret;
    };
};

const memoize = (method: Function): Function => {
    const map = initMemo(method);
    const ret = (...args: any[]): any => {
        let _ret = null;
        const _args = JSON.stringify(args);

        if (!map.has(_args)) {
            _ret = method(...args);
            map.set(_args, _ret);
        } else {
            _ret = map.get(_args);
        }

        return _ret;
    };
    ret.refresh = refresh(method);
    return ret;
};

memoize.refresh = refresh;
export default memoize;
