'use strict';
const Notification = require('../models/Notification');
const BigQuery = require('@google-cloud/bigquery');
const projectId = 'neon-concord-190906';
const bigquery = new BigQuery({
    projectId: projectId,
    keyFilename: './config/google-service-account.json'
});
let datasetId = 'manager_api_dataset';
let tableId = 'notifications';

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
    if (req.body.startDate === undefined || req.body.startDate === '' || req.body.endDate === undefined || req.body.endDate === '' || req.body.user_id === undefined || req.body.user_id === '')
        return res.status(400).json({ message: "Validation Failed! All fields are required('startDate','endDate','notification_id')."});

    let startDate = req.body.startDate;
        startDate = new Date(startDate*1000);
    let endDate = req.body.endDate;
        endDate = new Date(endDate*1000);
    let user_id = req.body.user_id;

    Notification.count({user_id:user_id, datetime:{ $gte: startDate, $lte: endDate }},function (err,count) {
        if (err) return res.status(400).json({message:err.message});
        return res.status(200).json({message: `Finded ${count} rows`,result:count});
    });


};

notifications.store = function(req, res){

    if (req.body.segments === undefined || req.body.segments === '' || req.body.datetime === undefined || req.body.datetime === '')
        return res.status(400).json({ message: "Validation Failed! All fields are required('segments','datetime')."});

    let segments = req.body.segments;
    let datetime = req.body.datetime;
    let date = new Date(datetime*1000);
    let notificationsArr = [];
    segments.forEach(function (value,key) {
        let notification_id = 'not'+Math.floor(Date.now() / 1000)+key;
        let notification = {
            user_id: value.userid,
            notification_id: notification_id,
            datetime: date,
            notification_action: 'sent'
        };
        Notification.create(notification,function (err,result) {
            if (err) return res.status(400).json({message: err.message});
            notificationsArr.push(notification);
            if (notificationsArr.length  === segments.length) {
                bigquery
                    .dataset(datasetId)
                    .table(tableId)
                    .insert(notificationsArr)
                    .then(() => {
                        return res.status(201).json({message: `Inserted ${notificationsArr.length} rows`, result: notificationsArr});
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
    Notification.findOneAndUpdate({notification_id:req.body.notification_id},{$set: notificationObj},function (err,notification) {
        if (err) return res.status(400).json({message: err.message});
        let sqlQuery = `UPDATE manager_api_dataset.notifications SET datetime = '${date}', notification_action = 'opened' WHERE  notification_id = '${req.body.notification_id}'`;
        let options = {
            query: sqlQuery,
            useLegacySql: false, // Use standard SQL syntax for queries.
        };
        bigquery
            .query(options)
            .then(results => {
                return res.status(200).json({message: "Updated successfully.",results: notificationObj});
            })
            .catch(err => {
                return res.status(400).json(err);
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
