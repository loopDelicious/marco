import React, { Component } from 'react';

class Result extends Component {

    render() {

        return (
            <iframe src={`http:${this.props.shortcode}`} >
                <p>RESULTS ARE HERE!!!</p>
            </iframe>
        )
    }
}

export default Result;
