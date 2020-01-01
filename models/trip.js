const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tripSchema = new Schema({
    departure: String,
    destination: String,
    day: String,
    month: String,
    year: String,
    time: String,
    bookedChair: Array
}, {collection: "trips"});

const tripModel = mongoose.model("tripModel", tripSchema);

module.exports = {
    tripModel
}