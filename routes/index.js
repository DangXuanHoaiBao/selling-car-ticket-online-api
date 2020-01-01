const express = require('express');
const router = express.Router();

const userController = require('../controllers/user');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/checkout', userController.checkout);

// router.get('/create-route', userController.createRoute);

router.get('/get-all-routes', userController.getAllRoutes);

router.post('/get-route-by-departure-and-destination', userController.getRouteByDepartureAndDestination);

router.post('/create-trip', userController.createTrip);

router.post('/create-fare', userController.createFare);

router.post('/get-trip-by-dep-des-date-and-time', userController.getTripDepDesDateAndTime);

module.exports = router;
