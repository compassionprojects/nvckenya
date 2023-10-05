const axios = require('axios');
const requestIp = require('request-ip');

const IP_API_URL = 'http://ip-api.com/json/';

export default async function getCountry(req, res) {
  const clientIp = requestIp.getClientIp(req);

  try {
    const { data } = await axios.get(IP_API_URL + clientIp);
    if (data.status === 'fail') throw new Error(data.message);
    res.json({ country: data.countryCode });
  } catch (e) {
    console.log(e);
    res.status(400).json({ error: e.toString() });
  }
}
