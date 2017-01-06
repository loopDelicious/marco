import React, { Component } from 'react';
var key = require('../../secrets.js');

class Result extends Component {

    render() {

        return (
            <div>
                <iframe id='destination-view' src={this.props.url} >
                </iframe>
                <iframe id='active-task-view' frameBorder="0" scrolling="no" marginHeight="0" marginWidth="0" width="100%" height="100%"
                        src={`https://dashboard.hypertrack.io/widget/task-detail/${this.props.taskId}?key=${key.hypertrack}`} >
                </iframe>
            </div>
        )
    }
}

export default Result;
