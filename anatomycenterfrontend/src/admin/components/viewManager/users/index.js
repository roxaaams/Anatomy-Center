// @flow

import React, { Component } from "react";
import md5 from "md5";

import Input from "react-toolbox/lib/input";
import { Button } from "react-toolbox/lib/button";
import { Service as api } from "../../auth";

import swal from "sweetalert";

import style from "./style"; // eslint-disable-line

window.swal = swal;
const errorMessage = (text: string, e: Error): void => swal({
    title: text,
    text: e.responseJSON && (
        e.responseJSON.validation &&
            e.responseJSON.validation.keys.length === 1
                ? `Field '${e.responseJSON.validation.keys[0]}' is invalid.`
                : `Fields ${e.responseJSON.validation.keys.map((key: string): string => `'${key}'`)} are invalid.` ||
        e.responseJSON.message
    ) || e.responseText || e.message,
    timer: 3000,
    type: "error",
    showConfirmButton: false,
});

export default class UsersComponent extends Component {
    state = {
        state: "notloaded",
        formFields: {},
    }

    componentWillMount = async (): Promise<void> => {
        await this.refreshUsers();
    }

    refreshUsers = async (): Promise<void> => {
        swal({
            title: "Refreshing Users",
            type: "info",
            showConfirmButton: false,
        });
        this.setState({ state: "loading" }, async (): Promise<void> => {
            try {
                const users = await api.instance.request("get", "users", "{}");
                this.setState({ state: "loaded", users }, (): void =>
                    swal({
                        title: "Users loaded",
                        type: "success",
                        showConfirmButton: false,
                        timer: 2000,
                    })
                );
            } catch (e) {
                errorMessage("Error while fetching users", e);
            }
        });
    }

    newUser = async (): Promise<void> => {
        try {
            if (["password", "repassword", "name", "email"].reduce(
                    (prev: bool, it: string): bool => (this.state.formFields[it] && this.state.formFields[it].length > 0
                        ? true
                        : swal({
                            title: "Invalid Field",
                            text: `Field ${it} is invalid.`,
                            type: "warning",
                            timer: 2000,
                        }) && false
                    ) && prev
                , true) &&
                (this.state.formFields.password === this.state.formFields.repassword
                    ? true
                    : swal({
                        title: "Passwords mismatch",
                        text: "The two passwords you entered do not match.",
                        type: "warning",
                        timer: 2000,
                    }) && false
                )) {
                await api.instance.request("post", "users", JSON.stringify({
                    name: this.state.formFields.name,
                    email: this.state.formFields.email,
                    password: this.state.formFields.password,
                }));
                this.setState({ formFields: {} });
                await this.refreshUsers();
            }
        } catch (e) {
            errorMessage(`Error while adding ${this.state.formFields.name}`, e);
        }
    }

    removeUser = async (email: string): Promise<void> => {
        try {
            await api.instance.request("delete", `users/${email}`, "{}");
            await this.refreshUsers();
        } catch (e) {
            errorMessage(`Error while removing ${email}`, e);
        }
    }

    list = (): any => this.state.users.map((it: Object): any => <div className={style.user} key={it.email}>
        <div className={style.img}>
            <img src={it.picture || `//www.gravatar.com/avatar/${md5(it.email)}`} alt="gravatar" />
        </div>
        <div className={style.text}>
            <h1>Name: {it.name}</h1>
            <h2>Email: {it.email}</h2>
        </div>
        <div className={style.buttons}>
            <li
                className={style.delete}
                onClick={(): void => swal({
                    title: "Confirm Delete",
                    text: `Are you sure you want to delete ${it.name}?`,
                    type: "warning",
                    showCancelButton: true,
                    showLoaderOnConfirm: true,
                    allowOutsideClick: true,
                }, async (): Promise<void> => {
                    await this.removeUser(it.email);
                    swal({
                        title: "Deleted!",
                        text: `${it.name} has been deleted.`,
                        type: "success",
                        timer: 2000,
                    });
                })}
            >Delete</li>
        </div>
    </div>).concat([<div className={[style.user, style.form].join(" ")}>
        <h1>New User</h1>
        <div className={style.pair} key="_new">
            <Input
                className={style.input}
                label="Name"
                hint="My Name"
                value={this.state.formFields.name || ""}
                onChange={(value: string): void => this.setState({ formFields: { ...this.state.formFields, name: value } })}
                required
            />
            <Input
                className={style.input}
                label="Email"
                hint="a@b.com"
                type="email"
                value={this.state.formFields.email || ""}
                onChange={(value: string): void => this.setState({ formFields: { ...this.state.formFields, email: value } })}
                required
            />
        </div>
        <div className={style.pair}>
            <Input
                className={style.input}
                label="Password"
                hint="test1234"
                type="password"
                value={this.state.formFields.password || ""}
                onChange={(value: string): void => this.setState({ formFields: { ...this.state.formFields, password: value } })}
                required
            />
            <Input
                className={style.input}
                label="Password"
                hint="test1234"
                type="password"
                value={this.state.formFields.repassword || ""}
                onChange={(value: string): void => this.setState({ formFields: { ...this.state.formFields, repassword: value } })}
                required
            />
        </div>
        <Button
            label="Submit"
            onClick={this.newUser}
            raised
            primary
        />
    </div>])

    innerContent = (): any => {
        switch (this.state.state) {
        case "notloaded": return <h1>Asking server for data... </h1>;
        case "loading": return this.state.users && this.state.users.length > 0 && this.list() || <h1> Loading data from server... </h1>;
        case "loaded": return this.list();
        default: return <h1> Working on it... </h1>;
        }
    }

    render(): any {
        return (<div className={style.container}>
            {this.innerContent()}
        </div>);
    }
}
