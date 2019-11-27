const express = require('express');
const router = express.Router();

const userController = require('../controllers/user');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/checkout', userController.checkout);

module.exports = router;
