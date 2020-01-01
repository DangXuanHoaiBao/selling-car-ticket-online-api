const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const billSchema = new Schema({
    amount: String,
    email: String,
    month: String,
    year: String
}, {collection: 'bills'});


const billModel = mongoose.model('billModel', billSchema);

module.exports = {
    billModel
}