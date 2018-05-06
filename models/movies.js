const mongoose = require("mongoose");

var Schema = mongoose.Schema;

var schemaMovies = new Schema({

    link: {
        type: String,
        required: true
    },

    headline: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    saved: {
        type: Boolean,
        required: false
    },
    review: {
        type: Schema.Types.ObjectId,
        ref: "review"
    }
});

var movie = mongoose.model("movie",schemaMovies)
module.exports = movie;
