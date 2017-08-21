import React, { Component } from "react";
import { installLanguages } from "./decorators";
import baseComponent from "../baseComponent";
import Flag from "lyef-flags";
import ripple from "react-toolbox/lib/ripple";
import $ from "jquery";

const FlagItem = (props: Object): Component =>
    <div {...props} className={[props.prop && props.styles[props.prop], props.styles.flagContainer].join(" ")}>
        <Flag country={props.flag} size="small" />
        {props.children}
    </div>;
const RippleFlagItem = ripple({ spread: 3 })(FlagItem);

@installLanguages
export default class LanguageSelectComponent extends baseComponent {
    constructor(...args: any[]) {
        super(require, ...args);
    }

    state = {
        menuActive: false,
    }

    get languages(): Array<Object> {
        const languages: Array<String> = this.props.language.instance.languages;
        const info: Object = this.props.language.instance.languagesInfo;
        return languages.map((lng: string): Object => true && {
            value: lng,
            label: info[lng].name,
            flag: info[lng].flag,
        });
    }

    changeLanguage(lng: string): string {
        this.props.language.instance.language = lng;
        this.setState({ menuActive: false });
    }

    get activeLanguage(): Object {
        return this.props.language.instance.languagesInfo[this.props.language.code] ||
            this.props.language.instance.languagesInfo.en_US;
    }

    componentWillMount() {
        this.clickElsewhereHook = (e: Event) => {
            const length = $(e.target).parents(`.${this.styles.container}`).length;
            if (length === 0) {
                this.setState({ menuActive: false });
            }
        };
        window.addEventListener("click", this.clickElsewhereHook);
    }
    componentWillUnmount() {
        window.removeEventListener("click", this.clickElsewhereHook);
    }


    render(): Component {
        return (<div className={this.styles.container}>
            <RippleFlagItem
                styles={this.styles}
                prop="active"
                flag={this.activeLanguage.flag}
                onClick={(): void => this.setState({ menuActive: true })}
            />
            <div className={[this.styles.card, this.state.menuActive && this.styles.active].join(" ")}>
                {this.languages.map((it: Object, index: Number): Component =>
                    <li key={index} className={this.styles.item}>
                        <RippleFlagItem styles={this.styles} flag={it.flag} onClick={(): void => ::this.changeLanguage(it.value)} />
                    </li>
                )}
            </div>
        </div>);
    }
}
