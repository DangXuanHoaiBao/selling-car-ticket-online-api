const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: String,
    password: String
}, {collection: "users"})

const userModel = mongoose.model("userModel", userSchema);
module.exports = {
    userModel
}