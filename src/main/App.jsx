import React, {Component} from 'react';
import {connect} from "react-redux";
import './App.css';


import {TrailsAnim} from "./anim";
import {CustomAnim} from "./customAnim";


class App extends React.Component {
    constructor(props) {
        super(props);
        this.CustomAnim = null;
    }

    componentDidMount() {
        this.CustomAnim = new CustomAnim();
        this.CustomAnim.loop();
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