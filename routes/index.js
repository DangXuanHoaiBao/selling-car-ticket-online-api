const express = require('express');
const stripe = require('stripe')('sk_test_cYmuj2bLSojoUobO6f98sCnE00VVt5m4Ay');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/charge', (req, res) => {
  const amount = 2500;
  stripe.customers.create({
    email: req.body.stripeEmail,
    source: req.body.stripeToken
  })
  .then(customer => stripe.charges.create({
    amount,
    description: 'selling car ticket online',
    currency: 'usd',
    customer: customer.id
  }))
  .then(charge => res.send({message: 'success'}))
  .catch(err => {console.log(err)});
})

module.exports = router;
