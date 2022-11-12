import React, {Component} from 'react';
import {connect} from "react-redux";
import './App.css';


import {CustomAnim2D} from "./CustomAnim2D";
import {PureWebGl} from "./PureWebGl";
import {ThreeExample} from './ThreeExample';


class App extends React.Component {
    constructor(props) {
        super(props);
        this.anim = null;
    }

    componentDidMount() {
        this.anim = new ThreeExample();
        this.anim.draw();

        // this.anim = new PureWebGl();
        // this.anim.draw();

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