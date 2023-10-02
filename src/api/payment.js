const mollieClient = require('../lib/mollie');
const { siteUrl } = require('../../gatsby-config');
const isDev = process.env.NODE_ENV === 'development';

const host = isDev ? 'http://localhost:8000' : siteUrl;

export default async function handler(req, res) {
  const { price } = req.body;
  const payment = await mollieClient.payments.create({
    amount: {
      value: price,
      currency: 'EUR',
    },
    description: 'My first API payment',
    redirectUrl: `${host}/processing`,
    webhookUrl: `${host}/api/webhook`,
  });

  console.log(payment);

  res.status(200).json({ paymentUrl: payment.getCheckoutUrl() });
}
