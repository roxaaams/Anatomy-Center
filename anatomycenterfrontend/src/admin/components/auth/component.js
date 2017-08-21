import baseComponent from "../baseComponent";
import { installLanguageSet } from "../../../shared/translation";
import { installAuthToken, ifNotLoggedIn, installAuthActions } from "./service";

@installLanguageSet("login")
@installAuthToken
@ifNotLoggedIn
@installAuthActions
export default class LoginComponent extends baseComponent {

    state: Object = {
        email: "",
        password: "",
        emailFocus: false,
        passwordFocus: false,
        snackbarActive: false,
        snackbarMessage: null,
    }

    constructor(...args: any[]) {
        super(require, ...args);
    }

    login() {
        this.setState({ snackbarMessage: null, snackbarActive: false });
        this.props.authActions.login(this.state.email, this.state.password)
            .then((data: any) => {
                if (!data) {
                    this.setState({ snackbarActive: true, snackbarMessage: "The eMail / Password combination is invalid" });
                } else {
                    console.log("Data", data, this.props.authToken);
                }
            }).catch((e: Error) => {
                this.setState({ snackbarMessage: e.message || e.responseText, snackbarActive: true });
            });
    }

}
