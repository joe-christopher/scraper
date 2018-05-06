const mongoose = require("mongoose");

var Schema = mongoose.Schema;

var schemaReviews = new Schema({

    body: String,
    title: String

});

var review = mongoose.model("review", schemaReviews);

module.exports = review;