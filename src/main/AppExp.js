import React, {Component} from 'react';
import {connect} from "react-redux";
import './AppExp.css';

import {CustomAnim2D} from "./CustomAnim2D";
import {PureWebGl} from "./PureWebGl";
import {ThreeExample} from './ThreeExample';
import {ThreeShadersExample} from './ThreeShadersExample';
import {ThreeShader2Channels} from './ThreeShader2Channels';
import {FBOExample} from './FBOExample';

class AppExp extends React.Component {
    constructor(props) {
        super(props);
        this.anim = null;
    }

    componentDidMount() {
        this.anim = new FBOExample();
        this.anim.entry();

        // this.anim = new ThreeShader2Channels();
        // this.anim.entry();

        // this.anim = new ThreeShadersExample();
        // this.anim.entry();

        // this.anim = new ThreeExample();
        // this.anim.draw();

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
    dispatch => ({})
)(AppExp);