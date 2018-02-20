'use strict';
const database = require('../../config/database');
const Notification = require('../models/Notification');
const Segment = require('../models/Segment');
const BigQuery = require('@google-cloud/bigquery');
const request = require('request');
const projectId = 'neon-concord-190906';
const bigquery = new BigQuery({
    projectId: projectId,
    keyFilename: './config/google-service-account.json'
});
const datasetId = 'manager_api_dataset';
const tableId = 'notifications';
const headers = {
    'Content-Type':     'application/json; charset=UTF-8'
};
const options = {
    url: 'http://35.227.74.227:8443/',
    method: 'POST',
    headers: headers,
    form: {}
};

function doRequest(options, callback){
    request(options, function (error, response, body) {
        if (!error) {
            callback(body);
        } else{
            callback({message: "We can't process right now as there is something went wrong."})
        }
    })
}
let notifications = {};

//
notifications.index = function(req, res){
    bigquery
        .dataset(datasetId)
        .table(tableId)
        .getRows()
        .then(results => {
            return res.status(200).json(results[0]);
        })
        .catch(err => {
            console.error('ERROR:', err);
        });

};

notifications.count = function(req, res){
    if (req.body.startDate === undefined || req.body.startDate === '' || req.body.endDate === undefined || req.body.endDate === '')
        return res.status(400).json({ message: "Validation Failed! All fields are required('startDate','endDate','notification_id')."});

    let whereObj = {};
    let startDate = req.body.startDate;
        startDate = new Date(startDate*1000);
    let endDate = req.body.endDate;
        endDate = new Date(endDate*1000);

    whereObj.datetime = { $gte: startDate, $lte: endDate };
    if (req.body.user_id !== undefined && req.body.user_id !== '') whereObj.user_id = req.body.user_id;
    Notification.count(whereObj,function (err,count) {
        if (err) return res.status(400).json({message:err.message});
        return res.status(200).json({message: `Finded ${count} rows`,result:count});
    });
};

notifications.store = function(req, res){

    if (req.body.segments === undefined || req.body.segments === '' || req.body.segments.length === 0 || req.body.datetime === undefined || req.body.datetime === '' || req.body.template_id === undefined || req.body.template_id === '')
        return res.status(400).json({ message: "Validation Failed! All fields are required('segments','datetime')."});
    let segments = req.body.segments;
    let template_id = req.body.template_id;
    let template_values = '';
    let datetime = req.body.datetime;
    let date = new Date(datetime*1000);

    if (req.body.template_values !== undefined)
        template_values = req.body.template_values;

    let notificationsArr = [];
    let userIDArr = [];
    let found = 0;
    let step = 0;
    segments.forEach(function (value,key) {
        step++;
        database.connection.db.collection(value, function (err, collection) {
            if (err) return;
            collection.find().toArray(function (err,rows) {
                if (err) return res.status(400).json({message: err.message});
                if (rows.length > 0) {
                    found++;
                }
                if (key === segments.length-1 && found === 0) {
                    return res.status(404).json({ message: "Not found Segments."});
                }
                rows.forEach(function (val,k) {
                    if (userIDArr.indexOf(val.userid) === -1) {
                        userIDArr.push(val.userid);
                        let notification_id = 'not'+Math.floor(Date.now() / 1000)+key+k;
                        let notification = {
                            user_id: val.userid,
                            notification_id: notification_id,
                            datetime: date,
                            notification_action: 'sent'
                        };
                        Notification.create(notification,function (err,result) {
                            if (err) return res.status(400).json({message: err.message});
                            notificationsArr.push(notification);
                            if(step === segments.length && k === rows.length-1 ) {
                                bigquery
                                    .dataset(datasetId)
                                    .table(tableId)
                                    .insert(notificationsArr)
                                    .then(() => {
                                        notificationsArr.forEach(function (value,key) {
                                            let reqObj = {
                                                uid:value.user_id,
                                                template_id:template_id,
                                                template_values: template_values,
                                                notification_id:value.notification_id,
                                                time:datetime
                                            };
                                            let opt = JSON.parse(JSON.stringify(options));
                                            opt.form = reqObj;
                                            doRequest(opt,function (response) {
                                                console.log(response);
                                            });
                                            if ( key === notificationsArr.length-1) {
                                                return res.status(201).json({message: `Inserted ${notificationsArr.length} rows`, result: notificationsArr});
                                            }
                                        });
                                    })
                                    .catch(err => {
                                        if (err && err.name === 'PartialFailureError') {
                                            if (err.errors && err.errors.length > 0) {
                                                console.log('Insert errors:');
                                                err.errors.forEach(err => console.error(err));
                                            }
                                        } else {
                                            console.error('ERROR:', err);
                                        }
                                    });
                            }
                        });
                    }
                });
            });
        });
    });
};

notifications.update = function(req, res){

    if (req.body.notification_id === undefined || req.body.notification_id === '' || req.body.user_id === undefined || req.body.user_id === '' || req.body.status === undefined || req.body.status === '')
        return res.status(400).json({ message: "Validation Failed! All fields are required('notification_id','user_id','status')."});
    let date = new Date();
    let notificationObj = {
        notification_id: req.body.notification_id,
        user_id: req.body.user_id,
        datetime: date,
        notification_action: req.body.status
    };

    Notification.create(notificationObj,function (err,result) {
        if (err) return res.status(400).json({message: err.message});
        bigquery
            .dataset(datasetId)
            .table(tableId)
            .insert(notificationObj)
            .then(() => {
                return res.status(201).json({message: `Row was inserted successfully.`, result: notificationObj});
            })
            .catch(err => {
                if (err && err.name === 'PartialFailureError') {
                    if (err.errors && err.errors.length > 0) {
                        console.log('Insert errors:');
                        err.errors.forEach(err => console.error(err));
                    }
                } else {
                    console.error('ERROR:', err);
                }
            });
    });

};

notifications.dataset = function(req, res){
    bigquery
        .createDataset(datasetId)
        .then(results => {
            const dataset = results[0];

            console.log(`Dataset ${dataset.id} created.`);
        })
        .catch(err => {
            console.error('ERROR:', err);
        });
};

notifications.table = function(req, res){
    const schema = "user_id:string, notification_id:string, datetime:string, notification_action:string";
    const options = {
        schema: schema
    };
    bigquery
        .dataset(datasetId)
        .createTable(tableId, options)
        .then(results => {
            const table = results[0];
            console.log(`Table ${table.id} created.`);
        })
        .catch(err => {
            console.error('ERROR:', err);
        });
};

module.exports = notifications;
