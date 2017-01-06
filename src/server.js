var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var key = require('../secrets.js');

var app = express();

// allow CORS access
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
    res.header("Content-Type", "application/json");
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// Task can have a Destination and ETA, task object represents an event that is performed by a driver on a trip.
// Create a trip, add tasks (with ETA) to the live trip

// POST request to create a DESTINATION, returns destination object (with geocoded location)
function setDestination(dest, callback) {

    var hypertrack_url = 'https://app.hypertrack.io/api/v1/destinations/';

    request.post({
        url: hypertrack_url,
        body: {
          "address": dest
        },
        headers: {
            Authorization: 'token ' + key.hypertrack,
            'Content-Type': 'application/json'
        },
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode == 201) {
            callback(false, body);
        } else {
            console.log('setDestination ' + error);
            callback(error);
        }
    });
};

// POST request to create a TASK with destination, returns task object
function createTask(destination, action, callback) {

    var hypertrack_url = 'https://app.hypertrack.io/api/v1/tasks/';

    request.post({
        url: hypertrack_url,
        body: {
            "destination_id": destination.id,
            "action": action
        },
        headers: {
            Authorization: 'token ' + key.hypertrack,
            'Content-Type': 'application/json'
        },
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode == 201) {
            callback(false, body);
        } else {
            console.log('createTask ' + error);
            callback(error);
        }
    });
};

// POST request to add a TASK to a LIVE TRIP with destination, returns task object
function addTask(task, trip, callback) {

    var hypertrack_url = `https://app.hypertrack.io/api/v1/trips/${trip.id}/add_task/`;

    request.post({
        url: hypertrack_url,
        body: {
            "task_id": task.id,
        },
        headers: {
            Authorization: 'token ' + key.hypertrack,
            'Content-Type': 'application/json'
        },
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            callback(false, body);
        } else {
            console.log('addTask ' + error);
            callback(error);
        }
    });

};

// PUT request to update TASK with start_location and custom URL
function updateTask(task, updates, callback) {

    var hypertrack_url = `https://app.hypertrack.io/api/v1/tasks/${task.id}/`;

    request.put({
        url: hypertrack_url,
        body: {
            "start_location": updates.location,
            "tracking_url": updates.url
        },
        headers: {
            Authorization: 'token ' + key.hypertrack,
            'Content-Type': 'application/json'
        },
        json: true
    }, function (error, response, body) {
        console.log(response.statusCode);
        if (!error && response.statusCode == 200) {
            callback(false, body);
        } else {
            console.log('updateTask ' + error);
            callback(error);
        }
    });

};

// POST request to create a TRIP with array of tasks and mode
function createTrip(task, mode, callback) {

    var hypertrack_url = 'https://app.hypertrack.io/api/v1/trips/';

    request.post({
        url: hypertrack_url,
        body: {
            "tasks": [task.id],
            "vehicle_type": mode,
        },
        headers: {
            Authorization: 'token ' + key.hypertrack,
            'Content-Type': 'application/json'
        },
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode == 201) {
            callback(false, body);
        } else {
            console.log('createTrip ' + error);
            callback(error);
        }
    });
};

// Invoke helper functions to create destination, driver, task, and trip
// to return trip object
app.post('/startTrip', function (req, res) {

    var destination = {}; // requires address or location
    var task = {}; // requires destination object
    var trip = {}; // requires task object, and optional mode

    setDestination(req.body.destination, function(err1, destObj){
        if (err1) {
            res.status(400).send(err1);
            return;
        }
        destination = destObj;
        createTask(destination, req.body.action, function(err2, taskObj){
            if (err2) {
                res.status(400).send(err2);
                return;
            }
            task = taskObj;
            createTrip(task, req.body.vehicle_type, function(err3, tripObj){
                if (err3) {
                    res.status(400).send(err3);
                    return;
                }
                trip = tripObj;
                var payload = {
                    trip: trip,
                    task: task,
                    destination: destination
                };
                res.send(payload);
            })
        })
    });
});

// Add a task to a live trip, requires task_id and trip_id
app.post('/addTask', function (req, res) {

    var destination = req.body.destination;
    var action = req.body.action;
    var trip = req.body.trip;
    var updates = {
        'location': req.body.location,
        'url': req.body.url
    };
    var task = {};


    createTask(destination, action, function(err1, taskObj) {
        if (err1) {
            res.status(400).send(err1);
            return;
        }
        task = taskObj;
        console.log('created taskObj!');
        addTask(task, trip, function(err2, response2) {
            if (err2) {
                res.status(400).send(err2);
                return;
            }
            console.log('added task to trip!');
            updateTask(task, updates, function(err3, response3) {
                if (err3) {
                    console.log(err3);
                    res.status(400).send(err3);
                    return;
                }
                res.send(response3);
            })
        })
    });
});

app.listen(process.env.PORT || 4500);
