'use strict';
//import dependency
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('../../server.js');

//create new instance of the mongoose.schema. the schema takes an 
//object that shows the shape of your database entries.

var ProjectSchema = new Schema({
    title: { type: String, trim: true, required: true },
    employer_id: { type: Number, required: true },
    employer_name: { type: String, required: true },
    freelancer_id: { type: Number, default: 0 },
    freelancer_name: { type: String, default: '' },
    description: { type: String, required: true },
    technology_stack: [String],
    budget_range: [{ type: String, required: true }],
    budget_period: { type: Number, required: true },
    project_document: { type: String, required: true },
    date_posted: { type: Date, default: Date.now },
    date_end: { type: String,default:'' },
    submission_document: [String],
    project_status: { type: String, required: true },
    bids: [
        {
            freelancer_id: Number,
            freelancer_name: String,            
            bid_amount: Number,
            bid_period: Number,
            bid_status: String,
            bid_date: { type: Date, default: Date.now },
        }
    ]
});

//export our module to use in server.js
ProjectSchema.plugin(autoIncrement.plugin, 'Project');
module.exports = mongoose.model('Project', ProjectSchema);