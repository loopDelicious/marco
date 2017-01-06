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
// Create a driver and trip, add tasks (with ETA) to the live trip

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

// POST request to create a DRIVER, returns driver object
function createDriver(mode, callback) {

    var hypertrack_url = 'https://app.hypertrack.io/api/v1/drivers/';

    request.post({
        url: hypertrack_url,
        body: {
            "vehicle_type": mode
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
            console.log('createDriver ' + error);
            callback(error);
        }
    });
};

// POST request to create a TASK with driver and destination, returns task object
function createTask(driver, destination, callback) {

    var hypertrack_url = 'https://app.hypertrack.io/api/v1/tasks/';

    request.post({
        url: hypertrack_url,
        body: {
            "destination_id": destination.id,
            "destination": destination,
            "driver_id": driver.id
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

// POST request to create a TRIP with driver and task
function createTrip(driver, task, callback) {

    var hypertrack_url = 'https://app.hypertrack.io/api/v1/trips/';

    request.post({
        url: hypertrack_url,
        body: {
            "driver_id": driver,
            "tasks": task,
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
app.post('/kickoff', function (req, res) {

    var destination = {};
    var driver = {};
    var task = {}; // requires driver and destination objects
    var trip = {}; // requires driver and task objects

    setDestination(req.body.destination, function(err1, destObj){
            if (err1) {
                res.status(400).send(err1);
            } else {
                destination = destObj;
            }
        createDriver(req.body.vehicle_type, function(err2, driverObj){
            if (err2) {
                res.status(400).send(err2);
            } else {
                driver = driverObj;
            }
            createTask(driver, destination, function(err3, taskObj){
                if (err3) {
                    res.status(400).send(err3);
                } else {
                    task = taskObj;
                }
                createTrip(driver, task, function(err4, tripObj){
                    if (err4) {
                        res.status(400).send(err4);
                    } else {
                        trip = tripObj;
                        res.send(trip);
                    }
                })
            })
        })
    });
});

app.listen(process.env.PORT || 4500);
