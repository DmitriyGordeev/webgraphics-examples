import React, {Component} from 'react';
import {connect} from "react-redux";
import './App.css';


// import {trailsLoop} from "./trailsAnimation";

import {TrailsAnim} from "./anim";

class App extends React.Component {
    constructor(props) {
        super(props);

        this.trailsAnim = null;
    }

    componentDidMount() {
        // trailsLoop();

        this.trailsAnim = new TrailsAnim();
        this.trailsAnim.start();
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