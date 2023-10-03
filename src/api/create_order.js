const crypto = require('crypto');
const mollieClient = require('../lib/mollie');
const { siteUrl } = require('../../gatsby-config');
const isDev = process.env.NODE_ENV === 'development';

const host = isDev ? 'https://1120-91-214-67-151.ngrok-free.app' : siteUrl;

const VAT_RATE = 19; // 19% for Germany
const CURRENCY = 'EUR';
const LOCALE = 'en_GB';

export default async function handler(req, res) {
  const {
    first_name,
    last_name,
    email,
    address,
    city,
    post_code,
    country,
    price,
    order_item,
  } = req.body;

  const amount = {
    value: price.toFixed(2),
    currency: CURRENCY,
  };

  const orderObject = {
    amount,
    orderNumber: createOrderId(),
    lines: [
      {
        type: 'digital',
        name: order_item,
        productUrl: siteUrl,
        quantity: 1,
        vatRate: VAT_RATE.toFixed(2),
        unitPrice: amount,
        totalAmount: amount,
        vatAmount: {
          currency: CURRENCY,
          value: (amount.value * (VAT_RATE / (100 + VAT_RATE))).toFixed(2),
        },
      },
    ],
    billingAddress: {
      streetAndNumber: address,
      city,
      postalCode: post_code,
      country,
      givenName: first_name,
      familyName: last_name,
      email,
    },
    locale: LOCALE,
    redirectUrl: `${host}/processing`,
    webhookUrl: `${host}/api/webhook`,
  };

  try {
    const order = await mollieClient.orders.create(orderObject);
    console.log(order);
    res.status(200).json({ paymentUrl: order._links.checkout });
  } catch (e) {
    console.log(e);
    res.status(400).json({ message: e.toString() });
  }
}

function createOrderId() {
  return crypto.randomBytes(16).toString('hex');
}
