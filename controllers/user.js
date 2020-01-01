const stripe = require("stripe")("sk_test_cYmuj2bLSojoUobO6f98sCnE00VVt5m4Ay");
const nodemailer = require("nodemailer");
const {routeModel} = require("../models/route");
const {tripModel} = require("../models/trip");
const {fareModel} = require("../models/fare");
const {billModel} = require("../models/bill");

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

    const transporter = nodemailer.createTransport("smtps://hoaibaodang1997%40gmail.com:baodang1997@smtp.gmail.com");
    const mailOptions = {
      from: 'BaoDang',
      to: bill.email,
      subject: "mail confirm book ticket",
      html: '<b>You must go to the nearest facility to receive ticket before 2 day departure</b>'
    }
    transporter.sendMail(mailOptions, function(err, info){
      if(err){
        return console.log(err);
      }
      console.log(info.response)
    });

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
        bookedChair: [fareInfo.numberChair]
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
  const {fareInfo} = req.body;
  const fare = {
    departure: fareInfo.departure,
    destination: fareInfo.destination,
    day: fareInfo.date.d,
    month: fareInfo.date.m,
    year: fareInfo.date.y,
    time: fareInfo.time,
    getOnDeparture: fareInfo.getOnDeparture,
    fullName: fareInfo.fullName,
    email: fareInfo.email,
    total: fareInfo.total,
    numberOfTicket: fareInfo.numberOfTicket
  }
  fareModel.create(fare, function(err){
    if(!err){
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