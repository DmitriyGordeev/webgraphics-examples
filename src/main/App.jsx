import React, {Component} from 'react';
import {connect} from "react-redux";
import './App.css';


class App extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        let c = document.getElementsByTagName("canvas")[0];
        let ctx = c.getContext("2d");

        // bring to display-size scale
        let dpr = window.devicePixelRatio;
        let cw = window.innerWidth;
        let ch = window.innerHeight;
        c.width = cw * dpr;
        c.height = ch * dpr;
        ctx.scale(dpr, dpr);

        ctx.moveTo(0, 0);
        ctx.lineTo(200, 100);
        ctx.stroke();
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