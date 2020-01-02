const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    email: String,
    fullName: String,
    comment: String,
    urlImg: String
}, {collection: "comments"});

const commentModel = mongoose.model("commentModel", commentSchema);
module.exports = {
    commentModel
}