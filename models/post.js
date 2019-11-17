// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var postSchema = mongoose.Schema({
    Username: String,
    Name: String,
    Owner: String,
    Type: String,
    Require: String,
    Place: String,
    Time: Number,
    Unittime: String,
    Money: Number,
    People: Number,
    Detail: String   
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Post', postSchema);