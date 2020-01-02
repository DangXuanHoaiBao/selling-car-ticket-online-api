const express = require('express');
const router = express.Router();
const userController = require("../controllers/user");

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/sign-up', userController.signUp);

router.post('/login', userController.login);

router.post('/update-info', userController.update_info);
 
router.post('/change-password', userController.change_password);

router.post('/check-to-signup-or-login', userController.checkToSignUpOrLogin);

module.exports = router;
