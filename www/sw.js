/* global fetch self */
self.addEventListener('fetch', function (event) {
    if (event.request.url.endsWith('amp-geo-0.1.js')) {
        console.log('Replacing amp-geo with self-hosted version.');
        return event.respondWith(
            fetch(
                'https://amp-geo.expt.dev/amp/v0/amp-geo-0.1.js',
                { mode : 'no-cors' })
        );
    }

    event.respondWith(
        fetch(event.request)
    );
});
