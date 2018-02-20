const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SegmentSchema = new Schema({
    user:  Array,
},{strict: true});

const Segment = mongoose.model('segments', SegmentSchema);


module.exports = Segment;