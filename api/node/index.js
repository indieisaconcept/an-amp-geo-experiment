const
    env     = process.env,
    path    = require('path'),
    fs      = require('fs'),
    ampGeo  = fs.readFileSync(path.join(__dirname, './amp-geo.txt'), 'utf8'),
    Maxmind = require('@maxmind/geoip2-node').WebServiceClient,
    geo     = new Maxmind(env.MAXMIND_ACC, env.MAXMIND_TOKEN),

    // Region mappings

    mapping = {
        'NSW' : 'sy',
        'VIC' : 'ml',
        'QLD' : 'br',
        'TAS' : 'ml',
        'SA'  : 'ad',
        'ACT' : 'sy',
        'NT'  : 'pr'
    };

/**
 * Responsible for inserting a locale into an amp-geo string.
 *
 * @param   {String} code A locale code
 * @returns {String}
 */
function setLocal (code) {
    const
        replacement = '{{AMP_ISO_COUNTRY_HOTPATCH}}',
        padding     = '                   ';

    return ampGeo.replace(replacement, `${code}${padding}`);
}

/**
 * Responsible for determining where a request has originated from & then using
 * metadata about said request to return a modfied version of amp-geo.
 *
 * @param  {Object} req HTTP request.
 * @param  {Object} res HTTP response.
 */
module.exports = (req, res) => {

    const ip = req.headers['x-real-ip'];

    if (!ip) { return res.end(ampGeo); }

    geo.city(ip).then(response => {

        if (!response) { return res.end(ampGeo); }

        const
            [sub]                = response.subdivisions,
            { isoCode : region } = sub,
            code                 = mapping[region];

        if (code) { return res.end(setLocal(code)); }

        // return an un-modified version of amp-geo.

        res.end(ampGeo);
    });
};
