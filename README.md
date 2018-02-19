# nodejs-api
Simple API created on nodejs using express which can be easily modified and extended

# run
```
npm install
npm start
```
after start you will run node server on 3000 port, which can be easily changed from the server.js
# token & request security
Request url - http://localhost:3000/api/v1/{method} <br/>
Request header - use 'Content-Type' header with value 'application/x-www-form-urlencoded'

# possible functions

#### /notifications

#Show all notifications
Returns json data from bigQuery.

URL

/notifications

Method:

GET

Success Response:

Code: 200 
Content: [
             {
                 "user_id": "11",
                 "notification_id": "not15189720290",
                 "datetime": "2018-02-18T16:10:00.000Z",
                 "notification_action": "sent"
             }
         ]




#Create notifications
Returns json data from created notifications.

URL

/notifications/create

Method:

POST

Data Params

 "segments" :  [
               {"_id":"5a607647e25b653351db0e7d","userid":"11","__v":0},
               {"_id":"5a608fa8e25b653351db0e7e","userid":"112","__v":0},
               {"_id":"5a608fa8e25b653351db0e7f","userid":"113","__v":0},
               {"_id":"5a608fa8e25b653351db0e80","userid":"114","__v":0},
               {"_id":"5a608fa8e25b653351db0e81","userid":"115","__v":0}
             ],
 "datetime": 1518970200(unix_timestamp)

Success Response:

Code: 201 
Content: {
             "message": "Inserted 5 rows",
             "result": [
                 {
                     "user_id": "11",
                     "notification_id": "not15189878620",
                     "datetime": "2018-02-18T16:10:00.000Z",
                     "notification_action": "sent"
                 },
                 {
                     "user_id": "112",
                     "notification_id": "not15189878621",
                     "datetime": "2018-02-18T16:10:00.000Z",
                     "notification_action": "sent"
                 },
                 {
                     "user_id": "113",
                     "notification_id": "not15189878622",
                     "datetime": "2018-02-18T16:10:00.000Z",
                     "notification_action": "sent"
                 },
                 {
                     "user_id": "115",
                     "notification_id": "not15189878624",
                     "datetime": "2018-02-18T16:10:00.000Z",
                     "notification_action": "sent"
                 },
                 {
                     "user_id": "114",
                     "notification_id": "not15189878623",
                     "datetime": "2018-02-18T16:10:00.000Z",
                     "notification_action": "sent"
                 }
             ]
         }

#Update notification
Returns json data updated notification.

URL

/notifications/update

Method:

PUT

Data Params

 "notification_id" :  "not15189721200",
 "user_id": 112,
 "status": "opened"

Success Response:

Code: 200 
Content: {
             "message": "Updated successfully.",
             "results": {
                 "notification_id": "not15189721200",
                 "user_id": "112",
                 "datetime": "2018-02-18T20:10:14.878Z",
                 "notification_action": "opened"
             }
         }
         
#notifications count
Returns json data notifications count.

URL

/notifications/count

Method:

POST

Data Params

 "startDate" :  1518739200,
 "endDate": 1518811200,
 "user_id": 11

Success Response:

Code: 200 
Content: {
             "message": "Finded 1 rows",
             "result": 1
         }

