import React, {Component} from 'react';
import {connect} from "react-redux";
import './App.css';


class App extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        window.requestAnimFrame = function () {
            return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (a) {
                window.setTimeout(a, 1E3 / 60)
            }
        }();

        document.onselectstart = function () {
            return false;
        };

        let c = document.getElementById('c');
        let ctx = c.getContext('2d');

        // brings to display-size scale
        let dpr = window.devicePixelRatio;
        let cw = window.innerWidth;
        let ch = window.innerHeight;
        c.width = cw * dpr;
        c.height = ch * dpr;
        ctx.scale(dpr, dpr);


        let rand = function (rMi, rMa) {
            return ~~((Math.random() * (rMa - rMi + 1)) + rMi);
        }

        ctx.lineCap = 'round';
        let orbs = [];
        let orbCount = 30;
        let radius;

        // let trailCB = document.getElementById('trail');
        // let trail = trailCB.checked;
        // let clearer = document.getElementById('clear');

        function createOrb(mx, my) {
            let dx = (cw / 2) - mx;
            let dy = (ch / 2) - my;
            let dist = Math.sqrt(dx * dx + dy * dy);
            let angle = Math.atan2(dy, dx);
            orbs.push({
                x: mx,
                y: my,
                lastX: mx,
                lastY: my,
                hue: 0,
                colorAngle: 0,
                angle: angle + Math.PI / 2,
                //size: .5+dist/250,
                size: rand(1, 3) / 2,
                centerX: cw / 2,
                centerY: ch / 2,
                radius: dist,
                speed: (rand(5, 10) / 1000) * (dist / 750) + .015,
                alpha: 1 - Math.abs(dist) / cw,
                draw: function () {
                    ctx.strokeStyle = 'hsla(' + this.colorAngle + ',100%,50%,1)';
                    ctx.lineWidth = this.size;
                    ctx.beginPath();
                    ctx.moveTo(this.lastX, this.lastY);
                    ctx.lineTo(this.x, this.y);
                    ctx.stroke();
                },
                update: function () {
                    let mx = this.x;
                    let my = this.y;
                    this.lastX = this.x;
                    this.lastY = this.y;
                    let x1 = cw / 2;
                    let y1 = ch / 2;
                    let x2 = mx;
                    let y2 = my;
                    let rise = y1 - y2;
                    let run = x1 - x2;
                    let slope = -(rise / run);
                    let radian = Math.atan(slope);
                    let angleH = Math.floor(radian * (180 / Math.PI));
                    if (x2 < x1 && y2 < y1) {
                        angleH += 180;
                    }
                    if (x2 < x1 && y2 > y1) {
                        angleH += 180;
                    }
                    if (x2 > x1 && y2 > y1) {
                        angleH += 360;
                    }
                    if (y2 < y1 && slope == '-Infinity') {
                        angleH = 90;
                    }
                    if (y2 > y1 && slope == 'Infinity') {
                        angleH = 270;
                    }
                    if (x2 < x1 && slope == '0') {
                        angleH = 180;
                    }
                    if (isNaN(angleH)) {
                        angleH = 0;
                    }

                    this.colorAngle = angleH;
                    this.x = this.centerX + Math.sin(this.angle * -1) * this.radius;
                    this.y = this.centerY + Math.cos(this.angle * -1) * this.radius;
                    this.angle += this.speed;

                }
            });
        }

        function orbGo(e) {
            let mx = e.pageX - c.offsetLeft;
            let my = e.pageY - c.offsetTop;
            createOrb(mx, my);
        }

        function turnOnMove() {
            c.addEventListener('mousemove', orbGo, false);
        }

        function turnOffMove() {
            c.removeEventListener('mousemove', orbGo, false);
        }

        // function toggleTrails() {
        //     trail = trailCB.checked;
        // }

        // function clear() {
        //     orbs = [];
        // }

        c.addEventListener('mousedown', orbGo, false);
        c.addEventListener('mousedown', turnOnMove, false);
        c.addEventListener('mouseup', turnOffMove, false);

        // trailCB.addEventListener('change', toggleTrails, false);
        // clearer.addEventListener('click', clear, false);

        let count = 100;
        while (count--) {
            createOrb(cw / 2, ch / 2 + (count * 2));
        }

        let loop = function () {
            window.requestAnimFrame(loop);
            // if (trail) {
            //     ctx.fillStyle = 'rgba(0,0,0,.1)';
            //     ctx.fillRect(0, 0, cw, ch);
            // } else {
            //     ctx.clearRect(0, 0, cw, ch);
            // }


            ctx.fillStyle = 'rgba(0,0,0,.1)';
            ctx.fillRect(0, 0, cw, ch);

            let i = orbs.length;
            while (i--) {
                let orb = orbs[i];
                let updateCount = 3;
                while (updateCount--) {
                    orb.update();
                    orb.draw(ctx);
                }

            }
        }

        loop();
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