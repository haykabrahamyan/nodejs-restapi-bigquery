'use strict';
const User = require('../models/User');
let users = {};

// Get USERS
users.index = function(req, res){
    User.find(function (err,users) {
        if (err) return res.status(400).json({message: err.message});
        return res.status(200).json(users);
    });
};

// Get USER by ID
users.show = function(req, res){
    let id = req.params.id;
    User.findById(id,function (err,user) {
        if (err) return res.status(400).json({message: err.message});
        return res.status(200).json(user);
    });
};

// Update USER by ID
users.update = function(req, res){

    let userObj = {};
    if (req.body.name !== undefined && req.body.name !== ''){
        userObj.name = req.body.name;
    }
    if (req.body.email !== undefined && req.body.email !== ''){
        if (!validateEmail(req.body.email))
            return res.status(400).json({message: "Validation Failed! Invalid email address."});
        userObj.email = req.body.email;
    }
    if (req.body.password !== undefined && req.body.password !== ''){
        userObj.password = req.body.password;
    }

    let id = req.params.id;
    userObj.updated_at = Date.now();

    User.findByIdAndUpdate(id,{ $set: userObj},function (err,user) {
        if (err) return res.status(400).json({message: err.message});
        return res.status(200).json(user);
    });
    
    
};

// Delete USER by ID
users.destroy = function(req, res){
    let id = req.params.id;
    User.findByIdAndRemove(id,function (err,user) {
        if (err) return res.status(400).json({message: err.message});
        return res.status(200).json(user);
    });
};

// Create USER
users.store = function(req, res){

    if (req.body.name === undefined || req.body.name === '' || req.body.email === undefined || req.body.email === '' || req.body.password === undefined || req.body.password === '' )
        return res.status(400).json({ message: "Validation Failed! All fields are required('name','email','password')."});

    if (!validateEmail(req.body.email))
        return res.status(400).json({message: "Validation Failed! Invalid email address."});

    let user = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    };

    User.create(user,function (err,result) {
        if (err) return res.status(400).json({message: err.message});
        return res.status(201).json({message: 'User created successfully', result: result});
    });

};

module.exports = users;

function validateEmail(email) {
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}