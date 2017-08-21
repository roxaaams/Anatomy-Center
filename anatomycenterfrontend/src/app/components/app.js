import React from "react";
import { Route, Switch } from "react-router-dom";
import { RouteTransition } from "react-router-transition";
import spring from "react-motion/lib/spring";

import { injectState } from "../../shared/services/state.js";
import ChromeWindowComponent from "../../shared/helpers/window/index";

const slideConfig = { stiffness: 100, damping: 50 };

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

import NavComponent from "./nav/index.js";
import UserDetails from "./users/index.js";
import Article from "./articles/article.js";
import Search from "./search/index.js";
import Leaderboards from "./users/leaderboard.js";

import style from "./style.sass";

export default injectState(["theme"])(({ history, location, state: { theme } }: Object): any => (<section className={theme || "light"}>
    <NavComponent history={history} />
    <div className={style.content}>
        <RouteTransition
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
                <Route exact path="/" render={(): any => <Article id="null" key="/" />} />
                <Route exact path="/user/leaderboards" render={(): any => <Leaderboards history={history} />} />
                <Route exact path="/user/:id" render={({ match }: Object): any => <UserDetails history={history} match={match} />} />
                <Route exact path="/search/:topic" render={({ match: { params: { topic } } }: Object): any => <Search topic={topic} history={history} />} />
                <Route exact path="/:id" render={({ match }: Object): any => <Article back={history.goBack} id={match.params.id} match={match} />} />
            </Switch>
        </RouteTransition>
        {/* <Route path="/search" component={() => <h1>Search</h1>} /> */}
    </div>
    <ChromeWindowComponent />
</section>));
