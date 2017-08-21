const { app, BrowserWindow, protocol } = require("electron");
const path = require("path");
const url = require("url");
const fs = require("fs");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow() {
  // Create the browser window.
    win = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        webPreferences: {
        //   devTools: false,
        //   webSecurity: false,
        },
    });

    win.loadURL(url.format({
        pathname: path.resolve(__dirname, "index.html"),
        protocol: "file",
        slashes: true,
    }));

    if (process.env.NODE_ENV === "development") {
        win.webContents.openDevTools();
    }

  // Emitted when the window is closed.
    win.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
        win = null;
    });
}

function init() {
    protocol.interceptFileProtocol("file", (req: any, callback: Function) => {
        const _rootUrl = unescape(req.url);
        const tryLoad = (_url: string): string =>
            [__dirname, process.cwd(), app.getAppPath()].map((rootUrl: string): string =>
                [_url, _url.substr(7)].map((variantUrl: string): string =>
                    [variantUrl, variantUrl.replace(/\/assets/, "")].map((processedUrl: string): string =>
                    [
                        (__url: string): string => path.resolve(rootUrl, __url),
                        (__url: string): string => path.resolve(rootUrl, __url.substr(1)),
                        (__url: string): string => path.resolve(rootUrl, __url.substr(4)),
                    ]
                        .map((func: Function): string => func(processedUrl))
                        .filter((it: string): bool => fs.existsSync(it))
                        .reduce((prev: string, it: string): string => prev || it, null)
                    ).reduce((prev: string, it: string): string => prev || it, null)
            ).reduce((prev: string, it: string): string => prev || it, null)
        ).reduce((prev: string, it: string): string => prev || it, null);
        callback({ path: tryLoad(_rootUrl) });
    }, (error: Error) => {
        if (error) console.error("Failed to register protocol", error);
    });

    createWindow();
}

protocol.registerStandardSchemes(["file"], { secure: true });
app.on("ready", init);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (win === null) {
        createWindow();
    }
});
