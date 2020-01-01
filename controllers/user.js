const stripe = require('stripe')('sk_test_cYmuj2bLSojoUobO6f98sCnE00VVt5m4Ay');
const {routeModel} = require("../models/route");
const {tripModel} = require("../models/trip");
const {fareModel} = require("../models/fare");

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

exports.createRoute  = function(req, res){
  const route = {
    departure: "Tien Giang",
    destination: "TPHCM",
    typeOfCar: "Mercedes",
    distance: 3000,
    fare: 1000,
    departureTime: ["7", "12", "17", "22", "3"],
    getOnDeparture: ["Cai be", "Cai lay", "Chau thanh", "Ap bac"]
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
    else{
      return res.status(200).json(null);
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
    if(err){
      return res.status(400).json(err);
    }
    else{
      return res.status(200).json("tạo vé thành công");
    }
  })
}

exports.getTripDepDesDateAndTime = function(req, res){
  const {departure, destination, date, time} = req.body;
  tripModel.findOne({"departure": departure, "destination": destination, "day": date.d, "month": date.m, "year": date.y, "time": time})
  .then(trip => {
    if(trip){
      return res.status(200).json(trip);
    }
    else{
      return res.status(200).json(null);
    }
  })
  .catch(err => console.log(err))
}