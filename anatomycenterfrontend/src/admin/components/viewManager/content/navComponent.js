// @flow

import React, { Component, PropTypes } from "react";
import { Service as api } from "../../auth";

import { throttle } from "lodash";

import Input from "react-toolbox/lib/input";

import { injectState } from "shared/services/state"; // eslint-disable-line
import swal from "sweetalert";
import style from "./nav"; // eslint-disable-line

class ItemController extends Component {
    static propTypes = {
        category: PropTypes.string,
        lng: PropTypes.string,
        swapUp: PropTypes.func,
        swapDown: PropTypes.func,
        refresh: PropTypes.func,
        onClick: PropTypes.func,
        active: PropTypes.bool,
        apiEndpoint: PropTypes.string,
    }

    state = {
        mode: "view",
    }

    componentWillMount = async (): Promise<void> => {
        this.refreshData();
    }

    componentWillReceiveProps(props: Object) {
        if (props.lng !== this.props.lng) {
            this.setState({
                name: null,
                slug: null,
            });
        }
    }

    refreshData = async (): Promise<void> => {
        const { apiEndpoint } = this.props;
        await this.setState({ data: (await api.instance.request("get", `${apiEndpoint}/${this.props.category}`))[0] });
    }

    updateName = throttle(
        async (): Promise<void> =>
            this.setState({ data: await api.instance.request("put", `${this.props.apiEndpoint}/${this.props.category}`, JSON.stringify({
                names: [{
                    lng: this.props.lng,
                    name: this.state.name,
                }],
            })) })
        , 2000, { leading: false })

    updateSlug = throttle(
        async (): Promise<void> =>
            this.setState({ data: await api.instance.request("put", `${this.props.apiEndpoint}/${this.props.category}`, JSON.stringify({
                slugs: [{
                    lng: this.props.lng,
                    slug: this.state.slug,
                }],
            })) })
        , 2000, { leading: false })

    get editMode(): any {
        const { lng, swapUp, swapDown, category, refresh, apiEndpoint } = this.props;
        const { names, slugs } = this.state.data || { names: [{ name: "Loading..." }], slugs: [{ slug: "Loading..." }] };

        const activeName = names.find((set: Object): bool => set.lng === lng) || names[0];
        const activeSlug = slugs.find((set: Object): bool => set.lng === lng) || slugs[0];

        return (<span className={style.edit}>
            <div className={style.order}>
                <div className={style.button} onClick={this.setState.bind(this, { mode: "view" })}>
                    <div className="mdi mdi-settings"></div>
                </div>
                {swapUp && <div className={style.button} onClick={swapUp}><div className="mdi mdi-chevron-up"></div></div>}
                {swapDown && <div className={style.button} onClick={swapDown}><div className="mdi mdi-chevron-down"></div></div>}
                <div className={style.button} onClick={(): void => api.instance.request("delete", `${apiEndpoint}/${category}`, "{}").then(refresh)}>
                    <div className="mdi mdi-close"></div>
                </div>
            </div>
            <div className={style.inputs}>
                <Input
                    label="Name"
                    hint={`Some ${apiEndpoint.replace(/s$/, "")}`}
                    value={this.state.name != null ? this.state.name : activeName.name}
                    onChange={(name: string): void => this.setState({ name }, this.updateName)}
                    required
                />
                <Input
                    label="Slug"
                    hint="http://.../this-is-the-slug/"
                    value={this.state.slug != null ? this.state.slug : activeSlug.slug}
                    onChange={(slug: string): void => this.setState({ slug }, this.updateSlug)}
                    required
                />
            </div>
        </span>);
    }

    get viewMode(): any {
        const { lng } = this.props;
        const { names } = this.state.data || { names: [{ name: "Loading..." }] };

        const activeName = names.find((set: Object): bool => set.lng === lng) || names[0];

        return (<h1 className={style.view}>
            <span onClick={this.props.onClick}>{activeName.name}</span>
            <div className={style.right}>
                <div
                    className="mdi mdi-settings"
                    onClick={(e: Event): any => {
                        console.log("CAUGHT", e);
                        e.preventDefault();
                        this.setState({ mode: "edit" });
                        return null;
                    }}
                />
            </div>
        </h1>);
    }

    render(): any {
        return (<li className={[style.item, this.props.active && style.active].join(" ")}>
            {this.state.mode === "view" ? this.viewMode : this.editMode}
        </li>);
    }
}

@injectState(["language.code"])
export default class NavComponent extends Component {
    static propTypes = {
        state: PropTypes.shape({
            language: PropTypes.shape({
                code: PropTypes.any,
            }),
        }),
        selectCallback: PropTypes.func,
        apiEndpoint: PropTypes.string,
        getApiEndpoint: PropTypes.string,
        swapEnabled: PropTypes.bool,
        newItemTemplate: PropTypes.func,
    }

    static defaultProps = {
        state: {
            language: {
                code: "en_US",
            },
        },
        swapEnabled: false,
    }

    state = {
        categories: [],
        active: null,
    }

    componentWillMount = async (): Promise<void> => {
        await this.refreshData();
    }

    componentWillReceiveProps = async (props: Object): Promise<void> => {
        if (this.props.apiEndpoint !== props.apiEndpoint || this.props.getApiEndpoint !== props.getApiEndpoint) {
            this.setState({ active: null, categories: [] }, (): Promise<void> => this.refreshData(props));
        }
    }

    refreshData = async (props: Object = this.props): Promise<void> => {
        const { apiEndpoint, getApiEndpoint } = props;
        const name = `${apiEndpoint[0].toUpperCase()}${apiEndpoint.substr(1)}`;
        swal({
            title: `Refreshing ${name}`,
            type: "info",
            showConfirmButton: false,
        });
        this.setState({ categories: await api.instance.request("get", `${getApiEndpoint || apiEndpoint}.ids`) });
        swal({
            title: `${name} collected`,
            type: "success",
            showConfirmButton: false,
            timer: 1000,
        });
    }

    render(): any {
        const { swapEnabled, apiEndpoint, selectCallback, newItemTemplate } = this.props;
        const lng = this.props.state.language.code || "en_US";
        const sorted = this.state.categories.sort((a: Object, b: Object): bool => a.order > b.order);
        return (<nav className={style.nav}>
            {sorted.map((cat: Object, index: number): any => <ItemController
                key={cat.id}
                category={cat.id}
                lng={lng}
                refresh={this.refreshData.bind(this, this.props)}
                onClick={this.setState.bind(this, { active: cat.id }, (): void => selectCallback(cat.id))}
                active={cat.id === this.state.active}
                apiEndpoint={this.props.apiEndpoint}
                {...(swapEnabled && index > 0 && { swapUp: async (): Promise<void> => {
                    await api.instance.request("post", `${apiEndpoint}/swap`, JSON.stringify({
                        id1: cat.id,
                        id2: sorted[index - 1].id,
                    }));
                    await this.refreshData();
                } })}
                {...(swapEnabled && index < sorted.length - 1 && { swapDown: async (): Promise<void> => {
                    await api.instance.request("post", `${apiEndpoint}/swap`, JSON.stringify({
                        id1: cat.id,
                        id2: sorted[index + 1].id,
                    }));
                    await this.refreshData();
                } })}
            />)}
            <div
                className={style.add}
                onClick={(): void => api.instance.request("post", apiEndpoint, JSON.stringify({
                    ...newItemTemplate(sorted, lng),
                    order: this.state.categories.length || 0,
                })).then(this.refreshData.bind(this, this.props))}
            ><div className={"mdi mdi-plus"}></div></div>
        </nav>);
    }
}
