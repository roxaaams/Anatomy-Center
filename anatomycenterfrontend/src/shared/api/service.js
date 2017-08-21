import { RequestsListType, ApiConfigType } from "./types";

const configDefault: ApiConfigType = {
    apiEndpoint: `${window.location.hostname || "localhost"}/api`,
    runFakeServer: false,
    runCors: true,
    looseFakeRoutes: true,
    apiVersion: 1,
};

const fetchPropsDefault: RequestsListType = {
    url: "echo",
    method: "GET",
    data: null,
    auth: false,
};

export default class ApiService {

    _config: Object = null;
    constructor(config: Object = configDefault) {
        this.config(config);
    }

    config(config: Object = configDefault) {
        const _config = Object.assign({}, config);

        _config.apiEndpoint = _config.apiEndpoint && _config.apiEndpoint.replace(
            /(.*[^\/])$/gm,
            "$1/"
        ); // Make sure API Endpoint always ends in a "/"

        this._config = Object.assign({}, configDefault, this._config, config);
    }

    fetch(opts: Object | String = fetchPropsDefault): Promise<Response> {
        let _opts = opts;

        if (_opts.substr) {
            _opts = { url: _opts };
        }
        _opts = Object.assign({}, fetchPropsDefault, _opts);

        const { runFakeServer } = this._config;
        return (runFakeServer ? ::this._fakeAPICall : ::this._APICall)(_opts); // eslint-disable-line
    }


    _fakeData: ?Object = null;
    _fakeAPICall(opts: Object = fetchPropsDefault): Promise<Response> {
        const { url, method } = opts;
        const { looseFakeRoutes } = this._config;

        let ret = null;
        if (this._fakeData && this._fakeData[url]) {
            ret = this._fakeData[url][method] || (looseFakeRoutes && method === "GET" && this._fakeData[url]);
        }

        return new Promise((accept: Function, reject: Function): void =>
            ret &&
                accept(
                    new Response(
                        this._makeBlob(ret),
                        { status: 200 }
                    )
                )
            || reject()
        );
    }
    _loadFakeAPIData(data: Object) {
        this._fakeData = Object.assign({}, this._fakeData, data);
    }

    _APICall(opts: Object = fetchPropsDefault): Promise<Response> {
        const { url, method, data } = opts;
        const { apiEndpoint, apiVersion, runCors } = this._config;

        let _data = data;
        if (!(
            (data instanceof Blob) ||
            (data instanceof FormData)
        )) {
            _data = this._makeBlob(data);
        }

        return fetch(`${apiEndpoint.replace(/\/$/, "")}/v${apiVersion}/${url}`, {
            method,
            ...(method.toLowerCase() !== "get" ? { body: _data } : {}),
            mode: runCors ? "cors" : "no-cors",
        });
    }

    _makeBlob(obj: Object): Blob {
        return new Blob([JSON.stringify(obj)], { type: "application/json" });
    }

    static _instance: ApiService;
    static get instance(): ApiService {
        if (!this._instance) {
            this._instance = new this();
        }
        return this._instance;
    }
}
