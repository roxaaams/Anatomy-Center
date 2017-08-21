const paths = require
    .context("./fakedata")
    .keys()
    .map((path: String): String => path.substr(2))
    .filter((path: String): Boolean => path.indexOf(".") >= 0);
import { findAndCreate } from "shared-helpers/routeTool"; // eslint-disable-line

const pathsMap = {};
paths.forEach((path: String): void => findAndCreate(pathsMap, path));

const posts = {};
Object.keys(pathsMap).forEach((category: String) => {
    posts[category] = posts[category] || {};
    const categorySet = posts[category];

    Object.keys(pathsMap[category]).forEach((permalink: String) => {
        const post = {
            category,
            permalink,
            ...(require(`./fakedata/${category}/${permalink}/index`)), // eslint-disable-line
        };

        Object.keys(post.titles).forEach((language: String) => {
            let content = "";
            try {
                content = require(`./fakedata/${category}/${permalink}/${language}.md`); // eslint-disable-line
            } catch (e) {
                content = "# Work in progress";
            }

            post.texts = {
                ...post.texts,
                [language]: content,
            };
        });

        categorySet[permalink] = {
            ...categorySet[permalink],
            ...post,
        };
    });
});

const routes = Object
    .keys(posts)
    .filter((category: String): Boolean => category.indexOf(".") < 0)
    .reduce((categoriesAccumulator: Object, category: String): Object => true && {
        ...categoriesAccumulator,
        [`v1/diseases/${category}`]: {
            GET: Object.keys(posts[category]).map((permalink: String): Object => posts[category][permalink]),
        },
        ...(Object.keys(posts[category]).reduce((postsAccumulator: Object, permalink: String): Object => true && {
            ...postsAccumulator,
            [`v1/diseases/${category}/${permalink}`]: {
                GET: posts[category][permalink],
            },
        }, {})),
    }, {});

export default routes;
