// Code from: https://www.geeksforgeeks.org/making-a-simple-pwa-under-5-minutes/

var static_cache_name = "pwa";

self.addEventListener("install", (e) => {
	e.waitUntil(
		caches.open(static_cache_name).then((cache) => {
			return cache.addAll(["/"]);
		})
	);
});

self.addEventListener("fetch", (event) => {
	console.log(event.request.url);

	event.respondWith(
		caches.match(event.request).then((response) => {
			return response || fetch(event.request);
		})
	)
})
