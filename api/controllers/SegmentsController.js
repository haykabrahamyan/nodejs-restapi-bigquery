'use strict';
const User = require('../models/User');
const Segment = require('../models/Segment');

let segments = {};

//
segments.index = function(req, res){

    Segment.find(function (err,segments) {
        if (err) return res.status(400).json({message:err.message});
        if (segments.length === 0) {
            let UIDs = [11,16,18,26,48,112,115,114,156,189,144,128,136,141,108,109,110,124,180,181];
            User.find(function(err, users) {
                if (err) return res.status(400).json({message:err.message});
                if (users.length === 0) {
                    let insertedUserIDs = [];
                    UIDs.forEach(function (value,key) {
                        User.create({userid:value},function (err,result) {
                            if (err) return res.status(400).json({message:err.message});
                            insertedUserIDs.push(result);
                            if(insertedUserIDs.length === 5 ) {
                                Segment.create({user:insertedUserIDs},function (err,result) {
                                    if (err) return res.status(400).json({message:err.message});
                                });
                                insertedUserIDs = [];
                            }
                            if (key === UIDs.length-1) {
                                setTimeout(function () {
                                    Segment.find(function (err,segments) {
                                        if (err) return res.status(400).json({message:err.message});
                                        return res.status(200).json(segments);
                                    });
                                },100);
                            }
                        });
                    })
                } else  {
                    if (err) return res.status(400).json({message: err.message});
                    let userObj = [];
                    users.forEach(function (value,key) {
                        userObj.push(value);
                        if(userObj.length === 5 ) {
                            Segment.create({user:userObj},function (err,result) {
                                if (err) return res.status(400).json({message:err.message});
                            });
                            userObj = [];
                        }
                        if (key === UIDs.length-1) {
                            setTimeout(function () {
                                Segment.find(function (err,segments) {
                                    if (err) return res.status(400).json({message:err.message});
                                    return res.status(200).json(segments);
                                });
                            },100);

                        }

                    });
                }
            });
        } else {
            return res.status(200).json(segments);
        }

    });


};

module.exports = segments;
