const mollieClient = require('../lib/mollie');

const host = process.env.DOMAIN_HOST;

const CURRENCY = 'EUR';

export default async function handler(req, res) {
  const { value } = req.body;

  const redirectUrl = `${host}/donation-thanks`;
  const description = 'Donation for NVC Kenya 2023 scholarship funds';
  const amount = {
    value: parseInt(value, 10).toFixed(2),
    currency: CURRENCY,
  };

  try {
    const payment = await mollieClient.payments.create({
      amount,
      description,
      redirectUrl,
    });
    res.status(200).json({ paymentUrl: payment._links.checkout });
  } catch (e) {
    console.log(e);
    res.status(400).json({ message: e.toString() });
  }
}
