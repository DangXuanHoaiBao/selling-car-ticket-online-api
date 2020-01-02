const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const fareSchema = new Schema({
    departure: String,
    destination: String,
    day: String,
    month: String,
    year: String,
    getOnDeparture: String,
    fullName: String,
    email: String,
    fare: Number,
    time: String,
    numberOfTicket: String
}, {collection: "fares"})

const fareModel = mongoose.model("fareModel", fareSchema);

module.exports = {
    fareModel
}