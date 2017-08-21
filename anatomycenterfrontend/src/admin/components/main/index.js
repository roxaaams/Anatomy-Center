require("normalize.css/normalize.css");

import BaseComponent from "../baseComponent";
import { installLanguageSet } from "../../../shared/translation";
import { installAuthActions, installAuthToken } from "../auth";

@installAuthActions
@installAuthToken
@installLanguageSet("nav")
class AppComponent extends BaseComponent {

    constructor(...args: any[]) {
        super(require, ...args);
    }

    state = {
        colorScheme: "light",
        title: "Admin Panel",
    }

    componentWillMount() {
        setTimeout(() => {
            document.querySelector("body").className += " active";
        }, 500);
        this.setState({ colorScheme: localStorage.getItem("theme") || this.state.colorScheme });
    }

    switchColorScheme() {
        const colorScheme = this.state.colorScheme === "light" && "dark" || "light";
        this.setState({ colorScheme });
        localStorage.setItem("theme", colorScheme);
    }
}

export default AppComponent;
