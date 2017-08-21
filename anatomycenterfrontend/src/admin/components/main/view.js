import React, { Component } from "react";

// import { tinyGif } from "../../../shared/defines";
import { Component as AuthComponent } from "../auth";
import ViewManagerComponent from "../viewManager";

export default class AppComponentView {

    static render(): Component {
        return (
            <div className={[this.styles.wrapper, this.state.colorScheme, this.props.authToken && this.styles.loggedin].join(" ")}>
                <section className={this.styles.content}>
                    <AuthComponent />
                    <ViewManagerComponent />
                </section>
            </div>
        );
    }
}
