const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE);

router.post('/', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  );

  // Request headers you wish to allow
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With,content-type'
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  console.log(req.body.items);
  const { email, username } = req.body;
  console.log(email, username);

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Nutrition Consultant',
            },
            unit_amount: 4900,
          },

          quantity: 1,
        },
      ],

      success_url: `${process.env.DOMAIN}/successful-payment/?email=${email}&name=${username}`,
      cancel_url: `${process.env.DOMAIN}/unsuccessful-payment/?email=${email}&name=${username}`,
    });

    res.json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/app/', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  );

  // Request headers you wish to allow
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With,content-type'
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  console.log('stripe id', req.body.items);
  const email = '';
  const storeItems = new Map([
    [1, { priceInCents: 2500, name: 'Consultant Session' }],
    [2, { priceInCents: 9700, name: 'Notrition Coaching 1 month' }],
    [3, { priceInCents: 23500, name: 'Notrition Coaching 3 month' }],
  ]);

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: req.body.items.map((item) => {
        const storeItem = storeItems.get(item.id);
        return {
          price_data: {
            currency: 'eur',
            product_data: {
              name: storeItem.name,
            },
            unit_amount: storeItem.priceInCents,
          },
          quantity: 1,
        };
      }),

      success_url: `${process.env.DOMAIN}/Success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.DOMAIN}/cancel`,
    });
    // if (success_url) {
    //   const request = mailjet.post('send').request({
    //     FromEmail: 'info@fitlinez.com',
    //     FromName: 'فیتلاینز',
    //     Subject: 'یادآوری تمدید دوره کوچینگ در فیتلاینز',
    //     'Html-part': `<p>سلام عزیز,</p> <p>دوره کوچینگ شما در فیتلاینز به اتمام رسیده است.</p><p>لطفا برای تمدید دوره و پرداخت هزینه <a href="https://www.fitlinez.com/price">کلیک </a> کنید</p>`,
    //     Recipients: [{ Email: email }],
    //   });
    //   console.log('email has been sent');
    // }
    res.json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
module.exports = router;
