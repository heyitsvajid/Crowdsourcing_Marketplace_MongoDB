'use strict';
//import dependency
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('../../server.js'); 
//create new instance of the mongoose.schema. the schema takes an 
//object that shows the shape of your database entries.

var PaymentSchema = new Schema({
    employer_id: { type: String },
    employer_name: { type: String},
    freelancer_id: { type: Number, required: true },
    freelancer_name: { type: String, required: true },
    amount: { type: Number, required: true },
    project_id: Number,
    project_name: { type: String},
    payment_type : { type: String, required: true },
    payment_date : {type: Date, default: Date.now},  
});

//export our module to use in server.js
PaymentSchema.plugin(autoIncrement.plugin, 'Payment');
module.exports = mongoose.model('Payment', PaymentSchema);