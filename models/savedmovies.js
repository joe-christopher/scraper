const mongoose = require("mongoose");

var Schema = mongoose.Schema;

var schemaSaved = new Schema({

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
    review: {
        type: Schema.Types.ObjectId,
        ref: "review"
    }
});

var savedmovie = mongoose.model("movie",schemaSaved)
module.exports = savedmovie;