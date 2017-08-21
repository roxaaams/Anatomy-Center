// @flow

import React from "react";  // eslint-disable-line
import { Router, Route } from "react-router";
import { uuid } from "./util";

import { runningHistory } from "./window/chrome";

const MATCH_INDEX = /\/?index$/;
const MATCH_400 = /\/?40[0-9]$/;

type RouteConfigType = {
    valid: Boolean,
    path: String,
    routes: ?any[],
    handler: any,
};

type RouteReduceType = {
    route: String,
    handler: Function,
    onEnter: ?Function,
}

const composeRoute: Function = function composeRoute(r: string | { path: string, params: ?string[] }): any[] {
    let str: string = "";
    let onEnter: ?Function = null;
    if (r.substr) {
        str = r.substr(0);
    }
    if (r.path) {
        str = r.path;
    }
    if (r.onEnter) {
        onEnter = r.onEnter;
    }
    if (r.params) {
        const paramsCompose: string = r.params.map((it: string): string => `:${it}`).join("/");
        if (!r.path) {
            str = paramsCompose;
        } else {
            str = `${str}/${paramsCompose}`;
        }
    }
    return [str, onEnter];
};

const findSubRoutes: Function = function findSubRoutes(route: RouteConfigType): RouteReduceType[] {
    let path: String = route.path;
    [MATCH_INDEX, MATCH_400].forEach((reg: RegExp) => {
        if (route.path.match(reg) != null) path = route.path.replace(reg, "");
    });

    return (route.routes || []).map(composeRoute).map((it: any[]): [String, Function] => {
        const s = it[0];
        const itCond : boolean = s !== "";
        const pathCond : boolean = path !== "";
        return [itCond && pathCond && `${path}/${s}`
        || (pathCond && path)
        || (itCond && s)
        || "", it[1]];
    }).map((it: any[]): RouteReduceType => true && { route: it[0], handler: route.handler, onEnter: it[1] });
};

export const findAndCreate: Function = function findAndCreate(object: Object, path: string): Object {
    let l: string[] = path.split("/");
    let f: string = l.splice(0, 1)[0];

    const o = object;
    if (f.indexOf(":") === 0) {
        f = [f, ...l].join("/");
        l = [];
    }
    if (!(f in o)) {
        o[f] = {};
    }
    if (l.length === 0) return (o[f]: Object);
    return findAndCreate((o[f]: Object), l.join("/"));
};

const reduceRoutes: Function = function reduceRoutes(routeSets: Array<Array<RouteReduceType>>): Object {
    const map: Object = {};
    routeSets.forEach((set: Array<RouteReduceType>): void => set.forEach((route: RouteReduceType) => {
        const o = findAndCreate(map, route.route);
        o._handler = route.handler;
        o._onEnter = route.onEnter;
    }));
    return map;
};

type HasHandlerType = {
    _handler: Function
}

const routeSetToReactRoutes: Function = function routeSetToReactRoutes(level: Object): Route[] {
    const keys: string[] = Object.keys(level);
    const _root: ?HasHandlerType = keys.indexOf("$root") >= 0 && level.$root || null;
    const _all: ?HasHandlerType = keys.indexOf("$all") >= 0 && level.$all || null;
    console.log("LEVEL", level);
    const list: Route[] = keys.filter((k: string): boolean => k.indexOf("$") !== 0 && k.indexOf("_") !== 0).map((k: string): Route =>
         (level[k]: HasHandlerType) && (level[k]: HasHandlerType)._handler != null && (
            Object.keys(level[k]).filter((it: String): bool => it[0] !== "_").length > 0
            && <Route key={uuid()} path={k} component={level[k]._handler} onEnter={level[k]._onEnter}>
                {routeSetToReactRoutes(level[k])}
            </Route>
            || (console.log("THIS HERE === ", level[k], k)) || <Route key={uuid()} path={k} component={level[k]._handler} onEnter={level[k]._onEnter} />
        ) || (
            Object.keys(level[k]).filter((it: String): bool => it[0] !== "_").length > 0
            && <Route key={uuid()} path={k} onEnter={level[k]._onEnter} >
                {routeSetToReactRoutes(level[k])}
            </Route>
        )
    );
    if (_all) {
        list.push(<Route key={uuid()} path="*" component={_all._handler} onEnter={_all._onEnter} />);
    }
    if (_root) {
        return (<Route key={uuid()} path="/" component={_root._handler} onEnter={_root._onEnter} >
            {list}
        </Route>);
    }
    return list;
};

const routesToReactRoutes: Function = function routesToReactRoutes(level: Object): Router {
    return (
        <Router history={runningHistory}>
            {routeSetToReactRoutes(level, "/")}
        </Router>
    );
};


export const findRoutes : Function = function findRoutes(ctx: Function): Router {
    let keys: string[] = (ctx.keys(): string[]);
    keys = keys.map(
        (it: string) : string => it.substr(2).replace(/\..*/, "")
    ).filter(
        (it: string, index: number, list: string[]): boolean => list.indexOf(it) === index
    );
    let routes: Array<RouteConfigType> = keys.map((it: string): RouteConfigType => {
        const ret: RouteConfigType = {
            path: it,
            valid: false,
            handler: null,
            routes: null,
        };
        try {
            const comp = ctx(`./${it}`);
            ret.valid = false;
            if (comp._routes && comp._routes.length > 0) {
                ret.valid = true;
                ret.routes = comp._routes;
                ret.handler = comp.default || comp;
            }
        } catch (e) {
            ret.valid = false;
        }
        return ret;
    });
    routes = routes.filter((it: RouteConfigType): boolean => it.valid);
    const routeSets: Array<Array<RouteReduceType>> = routes.map((it: RouteConfigType): RouteReduceType[] => findSubRoutes(it, ctx));
    const routeObject = reduceRoutes(routeSets);
    return routesToReactRoutes(routeObject);
};
