import fs from "fs";
import check from "check-types";

const generator = function generator(server: Object, rootpath: String, prefix: String = ""): Object {
    console.log("Grabbing routes for", rootpath, prefix);

    fs.readdirSync(rootpath).forEach((file: String) => {
        const path = `${rootpath}/${file}`;
        if (fs.lstatSync(path).isDirectory()) {
            generator(server, path, `${prefix}/${file}`);
        } else {
            if (!path.match(/\.spec\.js$/)) {
                try {
                    const content = require(path); //eslint-disable-line
                    if (check.array(content)) {
                        content.forEach((item: Object): void => server.route((item.path = `${prefix}${item.path}`) && item));
                    } else {
                        server.route((content.path = `${prefix}${content.path}`) && content);
                    }
                } catch (error) {
                    console.warn(`Path '${path}' is not a route`);
                    console.error(error);
                }
            }
        }
    });

    return server;
};

export default generator;
