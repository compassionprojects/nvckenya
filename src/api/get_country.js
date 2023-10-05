const request = require('request');

const GEOIP_API_URL = 'https://json.geoiplookup.io';

export default async function getCountry(req, res) {
  req.pipe(request(GEOIP_API_URL)).pipe(res);
}
