var mongoose = require('mongoose');

// define the schema for our user model
var applyjobSchema = mongoose.Schema({
    Jobref: String,
    Username: String,
    Firstname: String,
    Lastname: String,
    StudentID: Number,
    Faculty: String,
    Major: String,
    Telephone: Number,
    Facebook: String,
    LineID: String,    
    State: String
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Applyjob', applyjobSchema);