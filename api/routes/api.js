'use strict';

module.exports = function(app) {
    let users = require('../controllers/UserController');
    let notifications = require('../controllers/NotificationsController');
    let API_VERSION = '/api/v1';

    // API Routes for user
    app.get(API_VERSION + '/users', users.index);
    app.get(API_VERSION + '/users/:id', users.show);
    app.post(API_VERSION + '/users', users.store);
    app.put(API_VERSION + '/users/:id', users.update);
    app.delete(API_VERSION + '/users/:id', users.destroy);

    // API Routes for segment
    app.get(API_VERSION + '/notifications', notifications.index);
    app.post(API_VERSION + '/notifications/create', notifications.store);
    app.put(API_VERSION + '/notifications/update', notifications.update);
    app.post(API_VERSION + '/notifications/count', notifications.count);



    app.get(API_VERSION + '/migrate/dataset', notifications.dataset);
    app.get(API_VERSION + '/migrate/table', notifications.table);




};