import React, {Component} from 'react';
import {connect} from "react-redux";
import './App.css';


import {CustomAnim2D} from "./CustomAnim2D";
import {BaseAnim3D} from "./BaseAnim3D";


class App extends React.Component {
    constructor(props) {
        super(props);
        this.anim = null;
        // this.anim2 = null;
    }

    componentDidMount() {
        this.anim = new BaseAnim3D();
        this.anim.draw();
        //
        // this.anim2 = new CustomAnim2D();
        // this.anim.loop();
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