import React, { Component } from 'react';
import $ from 'jquery';
import Result from './polo.js';

class Tracker extends Component {

    host = window.location.hostname;

    state = {
        error: null,
        selectedOption: 'walking',
        results: null,
        shortcode: 'trck.at/ERMLWD'
    };

    focus = true;

    handleOptionChange = (changeEvent) => {
        this.setState({
            selectedOption: changeEvent.target.value
        });
    };

    handleForm = (e) => {
        e.preventDefault();

        var origin = 'placeholder';
        var destination = this.refs['destination-address'].value;
        var hyper_data = {
            destination: destination,
            vehicle_type: this.state.selectedOption
        };

        if (origin && destination) {
            // create driver and task
            $.ajax({
                url: 'http://' + this.host + ':4500/kickoff',
                type: 'post',
                data: JSON.stringify(hyper_data),
                contentType: 'application/json',
                success: (response) => {
                    this.setState({
                        results: response
                    });
                }
            });

        } else {

            this.setState({
                error: 'Please enter a destination.'
            });
        }
    };


    render() {

        return (
            <div>

                {this.state.results == null ?
                    <div className="container">
                        <form id="pin1-input" ref="user_form" onSubmit={this.handleForm} >
                            <input type="text" placeholder="set destination" ref="destination-address" autoFocus={this.focus} /><br/>


                            {this.state.error ? <div><span>{this.state.error}</span><br/></div> : null}

                            <div className="radio-buttons">
                                <label className="radio-inline"><input type="radio" name="mode" value="walking"
                                                                       checked={this.state.selectedOption === 'walking'}
                                                                       onChange={this.handleOptionChange}
                                /> walking</label>

                                <label className="radio-inline"><input type="radio" name="mode" value="bicycle"
                                                                       checked={this.state.selectedOption === 'bicycle'}
                                                                       onChange={this.handleOptionChange}
                                /> cycling</label>

                                <label className="radio-inline"><input type="radio" name="mode" value="car"
                                                                       checked={this.state.selectedOption === 'car'}
                                                                       onChange={this.handleOptionChange}
                                /> driving</label>
                            </div>

                            <button id="start-1" type='submit' >Set Destination</button>
                        </form>
                    </div>
                    :
                    <Result shortcode={this.state.shortcode} />
                }

            </div>
        )
    }
}

export default Tracker;
