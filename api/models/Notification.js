const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
    user_id:  {
        type:String,
        required: true
    },
    notification_id: {
        type:String,
        required: true
    },
    datetime: {
        type: Date,
        default: Date.now
    },
    notification_action: {
        type:String,
        required: true,
    }
},{strict: true});

const Notification = mongoose.model('notifications', NotificationSchema);


module.exports = Notification;