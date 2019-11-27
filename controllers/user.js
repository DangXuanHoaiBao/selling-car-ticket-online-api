const stripe = require('stripe')('sk_test_cYmuj2bLSojoUobO6f98sCnE00VVt5m4Ay');

exports.checkout = (req, res) => {
  
    const {token} = req.body;
    
    stripe.customers.create({
      email: token.email,
      source: token.id,
      description: 'customer'
    })
    .then(customer => stripe.charges.create({
      amount: '2500',
      description: 'payment for car ticket',
      currency: 'usd',
      customer: customer.id,
      receipt_email: token.email
    }))
    .then(charge => res.send({message: 'success'}))
    .catch(err => {console.log(err)});
  
};