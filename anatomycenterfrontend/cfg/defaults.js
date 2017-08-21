const path = require("path");
const srcPath = path.join(__dirname, "/../src");
const dfltPort = 8000;
function getDefaultModules(): Object {
    return {
        preLoaders: [],
        loaders: [
            {
                test: /\.css$/,
                loader: "style-loader!css-loader?modules!",
            },
            {
                test: /\.sass/,
                loader: `style-loader!css-loader?modules!sass-loader?outputStyle=expanded&indentedSyntax`,
            },
            {
                test: /\.scss/,
                loader: `style-loader!css-loader?modules!sass-loader?outputStyle=expanded`,
            },
            {
                test: /\.less/,
                loader: "style-loader!css-loader?modules!less-loader",
            },
            {
                test: /\.styl/,
                loader: "style-loader!css-loader?modules!stylus-loader",
            },
            {
                test: /\.(woff|woff2|ttf|eot|svg)(\?v=[0-9\.]*)?$/,
                loader: "file-loader",
            },
            {
                test: /\.(png|jpg|gif)$/,
                loader: "url-loader?limit=3000",
            },
            {
                test: /\.json$/,
                loader: "json-loader",
            },
            {
                test: /\.(mp4|ogg)$/,
                loader: "file-loader",
            },
            {
                test: /\.(md|markdown)$/,
                loader: "raw-loader",
            },
        ],
    };
}

module.exports = {
    srcPath,
    publicPath: "/",
    port: process.env.PORT || dfltPort,
    getDefaultModules,
    activeModule: process.env.REACT_WEBPACK_SRC || "app",
    targetBuild: process.env.NODE_TARGET || "web",
    postcss: (): Array<void> => [],
};
