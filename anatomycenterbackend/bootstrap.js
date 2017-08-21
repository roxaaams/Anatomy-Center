require("babel-register");
require("babel-polyfill");
require("./scaffolding/server.js").then(it => { it.runStandalone(); }).catch(e => console.error(e));
