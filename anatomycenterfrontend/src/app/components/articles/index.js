import React from "react";

import { Route, Switch } from "react-router-dom";
import { RouteTransition } from "react-router-transition";
import spring from "react-motion/lib/spring";

const slideConfig = { stiffness: 100, damping: 50 };

import Article from "./article";

const pushStyle = {
    atEnter: {
        offset: 100,
    },
    atLeave: {
        offset: spring(-100, slideConfig),
    },
};
const popStyle = {
    atEnter: {
        offset: -100,
    },
    atLeave: {
        offset: spring(100, slideConfig),
    },
};

export default ({ location, history }: Object): any => (<RouteTransition
    pathname={location.pathname}
    {...(history.action === "POP" ? popStyle : pushStyle)}
    atActive={{
        offset: spring(0, slideConfig),
    }}
    mapStyles={(styles: Object): Object => ({
        left: 0,
        right: 0,
        position: "absolute",
        top: 0,
        bottom: 0,
        transform: `translateX(${styles.offset}%)`,
    })}
    style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
    }}
>
    <Switch location={location} key={location.key}>
        <Route path="/" exact render={(): any => <Article id="null" key="/" />} />
        <Route path="/:id" exact render={({ match }: Object): any => <Article back={history.goBack} id={match.params.id} match={match} />} />
    </Switch>
</RouteTransition>);
