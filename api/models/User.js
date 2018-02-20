const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    userid:  {
        type:Number,
        required: true
    }
},{strict: true});

const User = mongoose.model('users', UserSchema);



module.exports = User;