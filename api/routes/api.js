'use strict';

module.exports = function(app) {
    let users = require('../controllers/UserController');
    let notifications = require('../controllers/NotificationsController');
    let segments = require('../controllers/SegmentsController');
    let API_VERSION = '/api/v1';

    // API Routes for user
    app.get(API_VERSION + '/users', users.index);
    app.get(API_VERSION + '/users/:id', users.show);
    app.post(API_VERSION + '/users', users.store);
    app.put(API_VERSION + '/users/:id', users.update);
    app.delete(API_VERSION + '/users/:id', users.destroy);

    // API Routes for notifications
    app.get(API_VERSION + '/notifications', notifications.index);
    app.post(API_VERSION + '/notifications/create', notifications.store);
    app.post(API_VERSION + '/notifications/update', notifications.update);
    app.post(API_VERSION + '/notifications/count', notifications.count);

    // API Routes for segments
    app.get(API_VERSION + '/segments', segments.index);



    app.get(API_VERSION + '/migrate/dataset', notifications.dataset);
    app.get(API_VERSION + '/migrate/table', notifications.table);




};