export type RequestsListType = {
    url: String,
    method: String,
    data: ?Object,
    auth: Boolean,
    propName: ?String,
};

export type ApiConfigType = {
    apiEndpoint: String,
    runFakeServer: Boolean,
    runCors: Boolean,
    looseFakeRoutes: Boolean,
};
