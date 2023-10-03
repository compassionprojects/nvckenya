const mollieClient = require('../lib/mollie');

export default async function handler(req, res) {
  const { id } = req.body;
  const order = await mollieClient.orders.get(id);

  console.log(order);
  const succeeded = order.isPaid || order.isAuthorized;

  if (succeeded) {
    // @todo: send out order confirmation to customer's email
  }

  res.status(200).send();
}
