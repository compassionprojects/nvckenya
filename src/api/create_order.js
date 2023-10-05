const crypto = require('crypto');
const mollieClient = require('../lib/mollie');
const { siteUrl } = require('../../gatsby-config');
const isDev = process.env.NODE_ENV === 'development';

const host = isDev ? 'https://06df-81-22-39-169.ngrok-free.app' : siteUrl;

const VAT_RATE = 0; // No vat for these courses
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
    totalPrice,
    items,
    // price,
    // can_pay,
    // price_slided,
    // need_accommodation,
    need_scholarship,
    // can_donate,
    // donation_amount,
    // activeTier,
  } = req.body;

  const totalAmount = {
    value: totalPrice.toFixed(2),
    currency: CURRENCY,
  };

  const lines = items.map((item) => {
    const amt = {
      value: item.amount.toFixed(2),
      currency: CURRENCY,
    };
    return {
      type: 'digital',
      name: item.name,
      productUrl: siteUrl,
      quantity: 1,
      vatRate: VAT_RATE.toFixed(2),
      unitPrice: amt,
      totalAmount: amt,
      vatAmount: {
        currency: CURRENCY,
        value: (amt.value * (VAT_RATE / (100 + VAT_RATE))).toFixed(2),
      },
    };
  });

  const billingAndShipping = {
    streetAndNumber: address,
    city,
    postalCode: post_code,
    country,
    givenName: first_name,
    familyName: last_name,
    email,
  };

  const orderObject = {
    amount: totalAmount,
    orderNumber: createOrderId(),
    lines,
    billingAddress: billingAndShipping,
    shippingAddress: billingAndShipping,
    locale: LOCALE,
    redirectUrl: `${host}/confirmation?need_scholarship=${need_scholarship}`,
    webhookUrl: `${host}/api/webhook`,
    cancelUrl: host,
  };

  try {
    const order = await mollieClient.orders.create(orderObject);
    res.status(200).json({ paymentUrl: order._links.checkout });
  } catch (e) {
    console.log(e);
    res.status(400).json({ message: e.toString() });
  }
}

function createOrderId() {
  return crypto.randomBytes(16).toString('hex');
}
