const stripe = require("stripe")("sk_test_cYmuj2bLSojoUobO6f98sCnE00VVt5m4Ay");
const nodemailer = require("nodemailer");
const passport = require('passport');
const jwt = require('jsonwebtoken');
const {routeModel} = require("../models/route");
const {tripModel} = require("../models/trip");
const {fareModel} = require("../models/fare");
const {billModel} = require("../models/bill");
const {userModel} = require("../models/user");
const {updateInfo} = require("../models/user");
const {changePassword} = require("../models/user");
const {commentModel} = require("../models/comment");

exports.checkout = (req, res) => {
  
  const {token, fare} = req.body;
  
  stripe.customers.create({
    email: token.email,
    source: token.id,
    description: "customer"
  })
  .then(customer => stripe.charges.create({
    amount: Number(fare),
    description: "payment for car ticket",
    currency: "usd",
    customer: customer.id,
    receipt_email: token.email
  }))
  .then(charge => {
    const bill = {
      amount: charge.amount,
      email: charge.billing_details.name,
      month: charge.payment_method_details.card.exp_month,
      year: charge.payment_method_details.card.exp_year
    }

    billModel.create(bill, function(err){
      if(!err){
        return res.status(200).json("Thanh toán thành công, thông tin vé sẽ được gửi về mail bạn đã cung cấp");   
      }
      else{
        return res.status(400).json("Thanh toán thất bại");
      }
    })
  })
  .catch(err => {console.log(err)});
}

exports.createRoute  = function(req, res){
  const route = {
    departure: "Sai Gon",
    destination: "Ca Mau",
    typeOfCar: "Mercedes",
    distance: 1000,
    fare: 300000,
    departureTime: ["7", "12", "17", "22"],
    getOnDeparture: ["Quận 1", "Quận 5", "Quận 10", "Thủ Đức"]
  }
  routeModel.create(route, function(err){
    if(err){
      return console.log("tạo tuyến đương thất bại");
    }
    else{
      return console.log("tạo tuyến đường thành công");
    }
  })
}

exports.getAllRoutes = function(req, res){
  routeModel.find({})
  .then(routes => {
    if(routes){
      return res.status(200).json(routes);
    }
  })
  .catch(error => console.log(error));
}

exports.getRouteByDepartureAndDestination = function(req, res){
  const {departure, destination} = req.body; 
  routeModel.findOne({"departure": departure, "destination": destination})
  .then(route => {
    if(route){
      return res.status(200).json(route);
    }
    else{
      return res.status(200).json(null);
    }
  })
  .catch(error => console.log(error));
}

exports.createTrip = function(req, res){
  const {fareInfo} = req.body;
  tripModel.findOne({"departure": fareInfo.departure, "destination": fareInfo.destination, 
                     "day": fareInfo.date.d, "month": fareInfo.date.m, 
                     "year": fareInfo.date.y, "time": fareInfo.time})
  .then(result => {
    if(!result){
      const trip = {
        departure: fareInfo.departure,
        destination: fareInfo.destination,
        day: fareInfo.date.d,
        month: fareInfo.date.m,
        year: fareInfo.date.y,
        time: fareInfo.time,
        bookedChair: fareInfo.numberChair
      }
      tripModel.create(trip, function(err){
        if(!err){
          return res.status(200).json("tạo chuyến đi thành công");
        }
        else{
          return res.status(400).json("tạo chuyến đi thất bại");
        }
      })
    }
    else{
      tripModel.findOneAndUpdate({"_id": result._id}, {$push: {bookedChair: fareInfo.numberChair}}, function(err){
        if(err){
          return res.status(400).json(err);
        }
        else{
          return res.status(200).json("cập nhật số ghê trong chuyến đi thành công");
        }
      })
    }
  })
}

exports.createFare = function(req, res){
  const {fareInfo, email} = req.body;
  let emailUser;
  if(email !== ""){
    emailUser = email;
  }
  else{
    emailUser = fareInfo.email
  }
  const fare = {
    departure: fareInfo.departure,
    destination: fareInfo.destination,
    day: fareInfo.date.d,
    month: fareInfo.date.m,
    year: fareInfo.date.y,
    time: fareInfo.time,
    getOnDeparture: fareInfo.getOnDeparture,
    fullName: fareInfo.fullName,
    email: emailUser,
    fare: fareInfo.fare,
    numberOfTicket: fareInfo.numberOfTicket
  }

  fareModel.create(fare, function(err, result){
    if(result){
      const transporter = nodemailer.createTransport("smtps://hoaibaodang1997%40gmail.com:baodang1997@smtp.gmail.com");
      const mailOptions = {
        from: 'BaoDang',
        to: fare.email,
        subject: "mail confirm book ticket",
        html: `You must go to the nearest facility to receive ticket before 2 day departure with code: ${result._id}`
      }
      transporter.sendMail(mailOptions, function(err, info){
        if(err){
          return console.log(err);
        }
        console.log(info.response)
      });

      return res.status(200).json("tạo vé thành công");
    }
  })
}

exports.getTripByDepDesDateAndTime = function(req, res){
  const {departure, destination, date, time} = req.body;
  tripModel.findOne({"departure": departure, "destination": destination, "day": date.d, "month": date.m, "year": date.y, "time": time})
  .then(trip => {
    if(trip){
      return res.status(200).json(trip);
    }
    else{
      return res.status(400).json("Không tìm thấy chuyến nào thõa điều kiện");
    }
  })
  .catch(err => console.log(err))
}

exports.signUp = async(req, res) => {
  const {fullName, birthDay, gender, address, email, password, urlImg} = req.body;
  const result = await userModel.findOne({email: email});
  if(result){
      console.log('email da ton tai');
      return res.status(400).json({message: 'Email đã tồn tại'});
  }
  // const hassPassword = await bcrypt.hash(password, '10');
  const user = {
      fullName: fullName,
      birthDay: birthDay,
      gender: gender,
      address: address,
      email: email,
      password: password,
      urlImg,
  }
  userModel.create(user, function(err){
      if(err){
          return res.status(400).json({message: err});
      }
      console.log("Đăng ký thành công");
  });
  return res.status(200).json({message: 'Đăng ký thành công'});
}

exports.login = function (req, res, next) {
  passport.authenticate('local', {session: false}, (err, user, message) => {
      if (err || !user) {
          console.log(err);
          return res.status(400).json({
              message
          });
      }
     req.login(user, {session: false}, (err) => {
         if (err) {
             res.send(err);
         }
         // generate a signed son web token with the contents of user object and return it in the response
         const token = jwt.sign(user, 'secret');
         return res.status(200).json({user, token});
      });
  })(req, res);
}

exports.getFaresOfUser = function(req, res){
  const {email} = req.body;
  fareModel.find({email})
  .then(fares => {
    if(fares){
      return res.status(200).json(fares)
    }
    else{
      return res.status(400).json("Không tìm thấy fares");
    }
  })
}

//Check type account Google or Facebook is exist to decide sign up or login
exports.checkToSignUpOrLogin = async(req, res) => {
  const {fullName, email, password, urlImg, typeAccount} = req.body;
  const user = {
      fullName: fullName,
      email: email,
      password: password,
      urlImg: urlImg,
      typeAccount: typeAccount
  }
  console.log(email);
  const result = await userModel.findOne({email: email});
  console.log(result);
  if(!result){
      userModel.create(user, function(err){
          if(err){
              console.log(err);
              return res.status(400).json({error: err});
          }
      });
  }
  
 
  const token = jwt.sign(user, "secret");
  return res.status(200).json({user, token});

}

//Update info of user
exports.update_info = (req, res, next) => {
    passport.authenticate("jwt", { session: false }, async (err, user, info) => {
      if (err) {
        console.log(err);
        return res.status(400).json({
          error: err
        });
      }
  
      if (info) {
        return res.status(400).json({
          message: info.message
        });
      } else {
        const { newUser } = req.body;
        console.log(newUser);
        if (newUser.fullName === '') {
          return res.status(400).json({
            message: "Vui lòng điền đủ thông tin"
          });
        }
        updateInfo(user.email, newUser, res);
      }
    })(req, res, next);
};

exports.change_password = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, async (err, user, info) => {
    if (err) {
      return res.status(400).json({
        error: err
      });
    }

    if (info) {
      return res.status(400).json({
        message: info.message
      });
    } else {
      const { newPassword, oldPassword } = req.body;
      console.log("old " + oldPassword);
      console.log("new " + newPassword);
      console.log(user.username);
      if (!newPassword || !oldPassword) {
          return res.status(400).json({
              message: "Vui lòng điền đủ thông tin"
          });
      }
      changePassword(user.email, user.password, newPassword, oldPassword, res);
    }
  })(req, res, next);
};

exports.addComment = function(req, res){
  const {comment, user} = req.body;
  commentModel.create({"comment": comment, "email": user.email, "fullName": user.fullName, "urlImg": user.urlImg})
  .then(comment => {
    if(comment){
      return res.status(200).json("Thêm comment thành công");
    }
    else{
      return res.status(400).json("Thêm comment thất bại")
    }
  })
  .catch(err => console.log(err));
}

exports.getAllComments = function(req, res){
  commentModel.find({})
  .then(comments => {
    if(comments){
      return res.status(200).json(comments)
    }
    else{
      return res.status(400).json("Không có comment nào");
    }
  })
}