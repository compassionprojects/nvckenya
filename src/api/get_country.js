const request = require('request');

const GEOIP_API_URL = 'https://api.db-ip.com/v2/free/self';

export default async function getCountry(req, res) {
  req.pipe(request(GEOIP_API_URL)).pipe(res);
}
