import React, {Component} from 'react';
import {connect} from "react-redux";
import './App.css';


import {trailsLoop} from "./trailsAnimation";


class App extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        trailsLoop();
    }


    render() {
        return (
            <div>
                <canvas id={"c"}/>
            </div>
        );
    }
}

export default connect(
    state => ({
        storeData: state
    }),
    dispatch => ({
    })
)(App);