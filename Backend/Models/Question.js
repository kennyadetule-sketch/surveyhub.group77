const mongoose = require("mongoose");
const dotenv = require("dotenv");

const questionSchema= new mongoose.Schema({
    survey: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Survey",
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['short-text','long-text','multiple-choice', 'checkbox', 'yes-no', 'rating' ]
    },
    text: {
        type: String,
        required: true
    },
    required: {
        type: Boolean,
        default: false
    },
    options: [{
        text: String
    }]

});  

module.exports = mongoose.model("Question", questionSchema);