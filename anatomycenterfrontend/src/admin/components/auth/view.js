import React, { Component } from "react";
import Input from "react-toolbox/lib/input";
import { Button } from "react-toolbox/lib/button";
import Snackbar from "react-toolbox/lib/snackbar";

export const render: Function = function render(): Component {
    const clean = (this.state.email.length === 0) && (this.state.password.length === 0);
    const emailValid = (this.state.email === "") || /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i.test(this.state.email); // eslint-disable-line
    const passwordValid = (this.state.password === "") || /^[a-zA-Z]\w{3,14}$/.test(this.state.password);
    return (<div className={this.styles.form}>
        <Input
            type="email"
            required
            value={this.state.email}
            label={this.props.translate("eMail Address")}
            error={!emailValid && this.props.translate("The eMail Address is invalid") || null}
            hint="tuxi@pinguini.ro"
            theme={this.styles}
            onChange={(data: Event): void =>
                ::this.setState({ email: data })
            }
        />
        <Input
            type="password"
            required
            value={this.state.password}
            label={this.props.translate("Password")}
            error={!passwordValid && this.props.translate("The password is invalid") || null}
            hint="test1234"
            theme={this.styles}
            onChange={(data: Event): void =>
                ::this.setState({ password: data })
            }
        />
        <Button
            theme={this.styles}
            raised
            primary
            disabled={!emailValid || !passwordValid}
            label={this.props.translate("Login")}
            onClick={::this.login}
        />
        {!clean && <Button
            theme={this.styles}
            accent
            label={this.props.translate("Reset")}
            onClick={(): void => ::this.setState({ email: "", password: "" })}
        />}
        <Snackbar
            className={this.styles}
            action={this.props.translate("Close")}
            active={this.state.snackbarActive}
            label={`${this.props.translate(this.state.snackbarMessage || "There has been a problem logging you in")}.`}
            timeout={3000}
            onTimeout={(): void => ::this.setState({ snackbarActive: false })}
            onClick={(): void => ::this.setState({ snackbarActive: false })}
            type="warning"
        />
    </div>);
};
