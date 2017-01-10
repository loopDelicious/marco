import React, { Component } from 'react';
import $ from 'jquery';

class Beacon extends Component {

    host = window.location.hostname;

    state ={
        inTransit: null,
    };

    geo = document.getElementById("geolocate");

    getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this.addTask);
        } else {
            this.geo.innerHTML = "Geolocation is not supported by this browser.";
        }
    };

    addTask = (position) => {

        var payload = {
            destination: this.props.destination,
            location: {
                "coordinates": [position.coords.latitude, position.coords.longitude]
            },
            trip: this.props.trip,
            url: null,
            action: "pickup"
        };

        $.ajax({
            url: 'http://' + this.host + ':4500/addGPS',
            type: 'post',
            data: JSON.stringify(payload),
            contentType: 'application/json',
            success: () => {
                this.setState({
                    inTransit: true
                });
                this.props.startTrip();
            }
        });
    };

    // TODO: show on my way button, change to update location

    render() {

        return (
            <div>

                <p>Allow location access so we can track your ETA.</p>
                <button id="geolocate" onClick={this.getLocation}>{this.state.inTransit ? 'Update Location' : 'On My Way!'}</button>

            </div>
        )
    }
}

export default Beacon;
