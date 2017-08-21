/* global WEBPACK_BUILD WEBPACK_ENV APP_VER */

console.log("ServiceWorker loaded!");

const CACHE_VERSION = `v${APP_VER}`;
const CACHE_NAME = `offline_${WEBPACK_BUILD}_${WEBPACK_ENV}_${CACHE_VERSION}`;
const IMG_CACHE_NAME = `img_${WEBPACK_BUILD}_${WEBPACK_ENV}`;
const TEMP_CACHE_NAME = `temp_offline_${WEBPACK_BUILD}_${WEBPACK_ENV}`;
const urlsToLoad = [
    (WEBPACK_BUILD === "app" && `/` || "/admin"),
    `/${WEBPACK_BUILD}.sw.js`,
    `/assets/${WEBPACK_BUILD}.js`,
    `${(WEBPACK_BUILD !== "app" ? `/${WEBPACK_BUILD}` : "")}/index.html`,
];

self.addEventListener("install", (e: Event) => {
    console.log("ServiceWorker Installed!");
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache: Cache): Promise => cache.addAll(urlsToLoad))
    );
});

self.addEventListener("fetch", (e: Event) => {
    const { request } = e;
    console.log("REQUEST", request.clone().url);
    e.respondWith(
        (async (): Response => {
            const match = await caches.match(request.clone());

            console.log("CHECKING MATCH", match);
            if (match) {
                return match;
            }

            console.log("ATTEMPTING FETCH", request.clone().url);
            const fetchResponse = await fetch(request.clone());

            console.log("FINDING CACHE TO SAVE IN");
            let cache = null;
            if (request.clone().url.match(/\.(jpg|jpeg|png|gif)$/i)) {
                cache = await caches.open(IMG_CACHE_NAME);
            } else {
                cache = await caches.open(TEMP_CACHE_NAME);
            }

            console.log("SAVING TO CACHE", cache);
            if (cache) {
                await cache.put(request.clone(), fetchResponse.clone());
            }

            return fetchResponse;
        })()
    );
});

self.addEventListener("activate", () => {
    console.log("ServiceWorker Activated!");
});
