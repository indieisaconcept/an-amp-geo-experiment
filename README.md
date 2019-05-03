# an amp-geo experiment

This aim of this project is to illustrate how [amp-geo](https://amp.dev/documentation/components/amp-geo) can be extended to support a far more granular view of a visitors locale whilst remaining a valid cacheable ( see caveats ) amp document.

>  **A live example is available here** : [https://amp-geo.expt.dev](https://amp-geo.expt.dev)

## Implementation Overview

As per the amp-geo documentation you can [self-host](https://amp.dev/documentation/components/amp-geo#self-hosting) your own version of the amp-geo component. This provides a high degree of flexibility.

### Approach

In the amp-geo configuration below, existing country codes have been re-purposed based upon rules defined in the self-hosted version. A corresponding ISOCountryGroups object is then used to translate these to more meaningful values for use within the document.

```JavaScript
<script type="application/json">
    {
        "AmpBind": true,
        "ISOCountryGroups": {
            "adelaide"  : ["ad"],
            "brisbane"  : ["br"],
            "melbourne" : ["ml"],
            "perth"     : ["pr"],
            "sydney"    : ["sy", "unknown"]
        }
    }
</script>
```

Unfortunately at this stage we cannot simply replace the amp project url with our own as this will fail validation, resulting in an un-cacheable amp page. ( [amphtml/issues/22123](https://github.com/ampproject/amphtml/issues/22123 ) )

### service workers FTW!

Validation errors can be worked around by registering a service worker which will listen out for requests to the amp project version of amp-geo & replace it with a request to the self-hosted version.

```JavaScript
self.addEventListener('fetch', function(event) {
    if (event.request.url.endsWith('amp-geo-0.1.js')) {
        return event.respondWith(
            fetch('./amp/v0/amp-geo-0.1.js', { mode: 'no-cors' })
        );
    }

    event.respondWith(
        fetch(event.request)
    );
});
```

### Caveats

This approach still does have a shortcoming though in that it does not work once served from a cache due to same-origin security polices for service workers.

> This eventually should not be an issue if you are using a signed exchange which permits retaining the original domain when serving cached pages. Though this is still dependant upon the resolution of a current limitation with Chrome, Service Workers & signed exchanges. See [amppackager/issues/280](https://github.com/ampproject/amppackager/issues/280) for more detail.

## Reference Implementation

A working implementation is provided in this project which makes use of [Maxmind](https://www.maxmind.com/en/home) for geo functionality & [now](https://zeit.co) for painless service deployment.

Whilst this project favours node.js, the implementation could be easliy ported to other languages, i.e PHP.

- See `api/node` for details of the amp-geo implementation
- See `www` for amp document implementation

### Deployments

Ensure you have a [now] & [maxmind] account setup to continue & review `./now.json` for deployment specific concerns.

```
// Run the below two commands to setup secure environment variables
// for the service

npx now secret add MAXMIND_ACC <maxmind-account-id>
npx now secret add MAXMIND_TOKEN <maxmind-api-token>

// Deployments are managed via npm scripts

npm run deploy:staging // deploys staging
npm run deploy:prod		 // deploys prod
```

## Manual Testing

Once live to manually verify this functionaliy follow the instructions outlined in amp-geos [documentation](https://amp.dev/documentation/components/amp-geo#debugging).
