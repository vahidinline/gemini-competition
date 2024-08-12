const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_TEST);

router.post('/createSubscription', async (req, res) => {
  console.log(req.body);
  const { email, paymentMethodId, product, name } = req.body;

  try {
    // Create a new customer
    const customer = await stripe.customers.create({
      email: email,
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    price_1OkvqyLvdXYGADCc5fVUtjok;

    // Create a new subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ plan: product }],
      expand: ['latest_invoice.payment_intent'],
    });

    res.json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      customer,
      url: subscription.latest_invoice.payment_intent.charges.data[0]
        .receipt_url,
      status: subscription.latest_invoice.payment_intent.status,
      invoice: subscription.latest_invoice.payment_intent.invoice,
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

module.exports = router;
