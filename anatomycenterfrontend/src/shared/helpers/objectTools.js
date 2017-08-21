export const initializeObject = (object: Object, paths: string[]|string, initializer: any): Object =>
    ((func: Function, ...args: any[]): Object => func(...args, func))(
        (obj: Object, sets: string[], init: any, previous: string[], next: Function): Object => ({
            ...obj,
            ...sets.map((it: string[]): string => it[0])
            .filter((it: any): boolean => it)
            .sort()
            .filter((it: string, index: number, arr: string[]): bool => arr.indexOf(it) === index)
            .map((it: string): [string, string[]] => [it, sets.filter((i: string[]): bool => i[0] === it).map((i: string[]): string[] => i.slice(1)).filter((i: string[]): bool => i.length > 0)])
            .reduce((prev: Object, it: string[]): Object => ({
                ...prev,
                [it[0]]: it[1].length > 0 ? next(obj[it[0]] || {}, it[1], init, [...previous, it[0]], next) : obj[it[0]] || (init && (init.apply ? init(obj[it[0]]) : init)),
            }), {}),
        }), object, (paths.substr ? [paths] : paths).map((it: string|string[]): string[] => it.substr && it.split(".") || it), initializer, []);

export const findObject = (object: Object, path: string[]|string): Object|null =>
    ((func: Function, ...args: any[]): Object => func(...args, func))(
        (obj: Object, p: string[], next: Function): Object|null => p.length === 1 && obj[p[0]] || (obj[p[0]] ? next(obj[p[0]], p.slice(1), next) : null)
    , object, path.substr ? path.split(".") : path);
