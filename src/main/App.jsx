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

        // const c = document.getElementById('c');
        // const ctx = c.getContext('2d');
        //
        // let dpr = window.devicePixelRatio;
        // let cw = window.innerWidth;
        // let ch = window.innerHeight;
        // c.width = cw * dpr;
        // c.height = ch * dpr;
        // ctx.scale(dpr, dpr);
        //
        // ctx.beginPath();
        // ctx.moveTo(20, 20);
        // ctx.lineWidth = 1;
        // ctx.lineCap = 'round';
        // ctx.lineTo(100, 100);
        // ctx.stroke();
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