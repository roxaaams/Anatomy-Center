/* eslint-disable react/prop-types */
import React, { Component } from "react";
import Service from "./service";

import { RequestsListType } from "./types";

export const hookApi = (ComposedComponent: Component): Component =>
    (props: Object): Component =>
        <ComposedComponent
            {...props}
            api={{
                fetch: ::Service.instance.fetch,
            }}
        />;

export const hookApiRequests = (
        requests: RequestsListType[] = [],
        defaults: Object = {
            returnType: "json",
            shouldRefreshOnProps: true,
        }
    ): Component => (ComposedComponent: Component): Component =>
        class extends Component {
            state = {}

            _requests = []
            refreshRequests(props: Object) {
                this._requests = requests.map((it: RequestsListType | Function): RequestsListType =>
                    !!(it.url) && it || it({ props }),
                );
            }

            async refreshAll(): Promise {
                return Promise.all(this._requests.map(::this.refresh));
            }
            async refresh(request: RequestsListType): Promise<any> {
                const { returnType } = defaults;
                const { url, propName } = request;

                const response: Response = await Service.instance.fetch(request);

                let data = null;
                if (returnType) {
                    data = await response[returnType]();
                    this.setState({ [propName || url]: data });
                }

                return data || (await response.then((res: Response): Blob => res.blob()));
            }

            componentWillMount() {
                ::this.refreshRequests(this.props);
                ::this.refreshAll();
            }

            componentWillReceiveProps(props: Object) {
                const { shouldRefreshOnProps } = defaults;
                ::this.refreshRequests(props);
                if (shouldRefreshOnProps) {
                    ::this.refreshAll();
                }
            }

            render(): Component {
                return (<ComposedComponent
                    {...this.props}
                    api={Object.assign({}, {
                        fetch: ::Service.instance.fetch,
                        refreshAllEndpoints: ::this.refreshAll,
                    }, this._requests.reduce((prev: Object, it: RequestsListType): Object => true && {
                        [it.url]: (): Promise<any> => ::this.refresh(it),
                    }, {}))}
                    state={Object.assign({}, this.props.state, this.state)}
                />);
            }

        };
