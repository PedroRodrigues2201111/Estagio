/*
Copyright 2015, 2019 Google Inc. All Rights Reserved.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
/*
List of Changes (as required by Apache License)
- Added loggins, bundle address matching
*/

const DEBUG = true;
const LOG = {
	success: (t) => {
		DEBUG && console.log(`%c ${t} `, "background: #4CAF50; color: #fcfcfc");
	},
	warn: (t) => {
		DEBUG && console.log(`%c ${t} `, "background: #FF9800; color: #fcfcfc");
	},
	error: (t) => {
		DEBUG && console.log(`%c ${t} `, "background: #BB2315; color: #fcfcfc");
	},
	log: (t) => {
		DEBUG && console.log(`%c ${t} `, "background: #222; color: #fcfcfc");
	},
	newLogger: (title) => {
		const messages = [];

		return {
			success: (t) => {
				messages.push([`%c ${t} `, "background: #4CAF50; color: #fcfcfc"]);
			},
			warn: (t) => {
				messages.push([`%c ${t} `, "background: #FF9800; color: #fcfcfc"]);
			},
			error: (t) => {
				messages.push([`%c ${t} `, "background: #BB2315; color: #fcfcfc"]);
			},
			log: (t) => {
				messages.push([`%c ${t} `, "background: #222; color: #fcfcfc"]);
			},
			print: (_) => {
				if (title) {
					DEBUG && console.log(`________________________________`);
					DEBUG && console.log(`%c  ${title}`, "font-size: 1.4em");
				}

				for (let m of messages) {
					DEBUG && console.log(...m);
				}
			},
		};
	},
};

// Incrementing OFFLINE_VERSION will kick off the install event and force
// previously cached resources to be updated from the network.
const OFFLINE_VERSION = 1;
const CACHE_NAME = "offline";
const BUNDLES_CACHE_NAME = "bundles";
const BUNDLES_DIR = /\/include\//;
const ASSETS_DIR = /\/assets\//;
const CACHE_DIRS = [BUNDLES_DIR, ASSETS_DIR];

// Customize this with a different URL if needed.
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
	event.waitUntil(
		(async () => {
			const cache = await caches.open(CACHE_NAME);
			// Setting {cache: 'reload'} in the new request will ensure that the response
			// isn't fulfilled from the HTTP cache; i.e., it will be from the network.
			await cache.add(new Request(OFFLINE_URL, { cache: "reload" }));
		})()
	);
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		(async () => {
			// Enable navigation preload if it's supported.
			// See https://developers.google.com/web/updates/2017/02/navigation-preload
			if ("navigationPreload" in self.registration) {
				await self.registration.navigationPreload.enable();
			}
		})()
	);

	// Tell the active service worker to take control of the page immediately.
	self.clients.claim();
});

self.addEventListener("fetch", (event) => {
	// We only want to call event.respondWith() if this is a navigation request
	// for an HTML page.
	var logger = LOG.newLogger(event.request.url);
	logger.log(`Fetching`);
	if (CACHE_DIRS.some((d) => d.test(event.request.url))) {
		logger.warn(`Matched`);
		event.respondWith(
			caches.open(BUNDLES_CACHE_NAME).then(function (cache) {
				return cache.match(event.request).then(function (response) {
					if (response) {
						logger.success(`Cache hit`);
						logger.print();

						event.waitUntil(
							fetch(event.request).then(function (response) {
								return cache.put(event.request, response);
							})
						);
						return response;
					}
					logger.error(`Cache miss`);
					logger.print();
					return fetch(event.request).then(function (response) {
						cache.put(event.request, response.clone());
						return response;
					});
				});
			})
		);
		return;
	}

	logger.warn(`Didn't match`);
	logger.print();
	if (event.request.mode === "navigate") {
		event.respondWith(
			(async () => {
				try {
					// First, try to use the navigation preload response if it's supported.
					const preloadResponse = await event.preloadResponse;
					if (preloadResponse) {
						return preloadResponse;
					}

					const networkResponse = await fetch(event.request);
					return networkResponse;
				} catch (error) {
					// catch is only triggered if an exception is thrown, which is likely
					// due to a network error.
					// If fetch() returns a valid HTTP response with a response code in
					// the 4xx or 5xx range, the catch() will NOT be called.
					console.log("Fetch failed; returning offline page instead.", error);

					const cache = await caches.open(CACHE_NAME);
					const cachedResponse = await cache.match(OFFLINE_URL);
					return cachedResponse;
				}
			})()
		);
	}

	// If our if() condition is false, then this fetch handler won't intercept the
	// request. If there are any other fetch handlers registered, they will get a
	// chance to call event.respondWith(). If no fetch handlers call
	// event.respondWith(), the request will be handled by the browser as if there
	// were no service worker involvement.
});
