import React, {Component} from 'react';
import {connect} from "react-redux";
import './App.css';


import {CustomAnim2D} from "./CustomAnim2D";
import {PureWebGl} from "./PureWebGl";
import {ThreeExample} from './ThreeExample';
import {ThreeShadersExample} from './ThreeShadersExample';
import {ThreeShader2Channels} from './ThreeShader2Channels';


class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tooltipHidden: false
        }

        this.tooltipTimer = null;

        this.anim = null;
    }

    componentDidMount() {
        this.anim = new ThreeShader2Channels();
        this.anim.entry();

        // console.log(`[]this.anim.bottleState = ${this.anim.bottleState}`);

        // this.anim = new ThreeShadersExample();
        // this.anim.entry();

        // this.anim = new ThreeExample();
        // this.anim.draw();

        // this.anim = new PureWebGl();
        // this.anim.draw();

        addEventListener('mousedown', (event) => {
            this.mouseDownHandler(event, this)
        });
    }

    componentWillUnmount() {
        // Make sure to remove the DOM listener when the component is unmounted.
        removeEventListener('mousedown', this.mouseDownHandler);
    }

    mouseDownHandler(event, componentRef) {
        componentRef.setState(prevState => {
            return {...prevState, tooltipHidden: true};
        });

        // Clear previously set timer
        if (componentRef.tooltipTimer != null) {
            clearTimeout(componentRef.tooltipTimer);
        }

        // Set new timer
        if (componentRef.anim.bottleState === 0) {
            componentRef.tooltipTimer = setTimeout(() => {
                componentRef.setState(prevState => {
                    return {...prevState, tooltipHidden: false};
                });
            }, 3000);
        }

    }

    render() {


        // If bottle moved to another state we set tooltip to hidden
        if (this.anim != null) {
            if (this.anim.bottleState > 0 && !this.state.tooltipHidden) {
                this.setState(prevState => {
                    return {...prevState, tooltipHidden: true}
                })
            }
        }


        return (
            <div>
                <canvas id={"c"}/>

                <div className={"tooltip-container"}
                     style={{opacity: 1.0 - this.state.tooltipHidden}}>

                    <p className={"tooltip"}>Drag the cap to the right</p>
                    <div className={'animated-ball'}/>
                </div>


            </div>
        );
    }
}

export default connect(
    state => ({
        storeData: state
    }),
    dispatch => ({})
)(App);