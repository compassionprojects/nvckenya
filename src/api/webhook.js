const mollieClient = require('../lib/mollie');

export default async function handler(req, res) {
  const { id } = req.body;
  const payment = await mollieClient.payments.get(id);

  console.log(payment);
  const isPaid = payment.isPaid();

  if (isPaid) {
    res.status(200).send();
  }
}
