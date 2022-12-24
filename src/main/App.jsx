import React, {Component} from 'react';
import {connect} from "react-redux";
import './App.css';
import './contact.css';
import './about.css';

import {CustomAnim2D} from "./CustomAnim2D";
import {PureWebGl} from "./PureWebGl";
import {ThreeExample} from './ThreeExample';
import {ThreeShadersExample} from './ThreeShadersExample';
import {ThreeShader2Channels} from './ThreeShader2Channels';


class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tooltipHidden: false,
            rotateTooltipHidden: true,
            contactDialogVisible: false,
            aboutDialogVisible: false
        }

        this.tooltipTimer = null;

        this.anim = null;
    }

    componentDidMount() {
        this.anim = new ThreeShader2Channels();
        this.anim.entry();

        // this.anim = new ThreeShadersExample();
        // this.anim.entry();

        // this.anim = new ThreeExample();
        // this.anim.draw();

        // this.anim = new PureWebGl();
        // this.anim.draw();

        addEventListener('mousedown', (event) => {
            this.mouseDownHandler(event, this)
        });

        this.rotateTooltipTimer();
    }


    /* start interval to check anim.bottleState every given period
    if this.anim.bottleState === 3 -> rotateTooltipHidden = false
    we show rotation tooltip on the screen */
    rotateTooltipTimer() {
        setInterval(() => {
            if (this.anim != null) {

                if (this.anim.bottleState === 3 && this.state.rotateTooltipHidden) {
                    this.setState(prevState => {
                        return {...prevState, rotateTooltipHidden: false}
                    })
                }

            }
        }, 300)
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
            console.log(`bottleState = ${this.anim.bottleState}`);
            if (this.anim.bottleState > 0 && !this.state.tooltipHidden) {
                this.setState(prevState => {
                    return {...prevState, tooltipHidden: true}
                })
            }
        }


        return (
            <div>
                <canvas id={"c"}/>

                <ul className={"top-menu"}>
                    <li onClick={() => {
                        this.setState({
                            ...this.state,
                            contactDialogVisible: !this.state.contactDialogVisible
                        })
                    }} style={{opacity: this.state.aboutDialogVisible ? 0.0 : 1.0}}>Contact</li>
                    <li onClick={() => {
                        this.setState({
                            ...this.state,
                            aboutDialogVisible: !this.state.aboutDialogVisible
                        })
                    }}>About</li>
                </ul>

                <div style={{opacity: 1.0 - this.state.rotateTooltipHidden}}
                   className={"main-text"}>
                    <h2 className={"header"}>Try our new citrus drink</h2>
                    Full of taste, packed with energy and perfect to take along either to office or gym.
                    <br/>
                    <br/>
                    <span className={"ingredients"}>
                        Ingredients:&nbsp;
                        <span style={{color: "#FFB59F"}}>orange</span> juice,&nbsp;
                        <span style={{color: "#FFD280"}}>lemon</span> juice,&nbsp;
                        <span style={{color: "#00C3AA"}}>lime</span> juice,&nbsp;
                        <span style={{color: "#00D8FA"}}>water</span>
                    </span>
                </div>

                <div className={"tooltip-container"}
                     style={{opacity: 1.0 - this.state.tooltipHidden}}>
                    <p className={"tooltip"}>Drag the cap to the right</p>
                    <div className={'animated-ball'}/>
                </div>

                <p className={"rotate-tooltip"}
                   style={{opacity: 1.0 - this.state.rotateTooltipHidden}}>Rotate with mouse</p>

                {/* Contact dialog */}
                <div className={"contact-dialog"}
                     style={{opacity: this.state.contactDialogVisible ? 1.0 : 0.0}}>
                    <input type="email" id="email" placeholder={"email"}
                               size="30" required />

                    <input id={"submit"}
                           type={"submit"}
                           value={"Send"} onClick={() => {}}/>
                </div>

                {/* About dialog */}
                <div className={"about-dialog"}
                    style={{left: this.state.aboutDialogVisible ? '60%' : '100%'}}>

                    <p className={"about-content"}>
                        <p>Our company is producing and delivering the best quality drinks,
                            packed with flavour but consisting of natural ingredients,
                            carefully grown and collected from our own gardens.</p>
                        <br/>
                        <p>You can write us for further information using email below</p>
                        <br/>
                        <p className={"email"}>drinks@company.com</p>
                    </p>
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