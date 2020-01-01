const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const routeSchema = new Schema({
    departure: String,
    destination: String,
    typeOfCar: String,
    distance: Number,
    numberOfTrip: Number,
    fare: Number,
    departureTime: Array,
    getOnDeparture: Array
}, {collection: "routes"});

const routeModel = mongoose.model("routeModel", routeSchema);

module.exports = {
    routeModel
}