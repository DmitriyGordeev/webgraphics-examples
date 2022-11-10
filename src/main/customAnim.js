import {BaseAnim} from "./baseAnim";


export class CustomAnim extends BaseAnim {
    constructor() {
        super();

        let thisRef = this;

        this.obj = {
            x: 60,
            y: 60,
            lastX: 0,
            lastY: 0,
            hue: 0,
            colorAngle: 1,
            size: 30,
            centerX: thisRef.cw / 2,
            centerY: thisRef.ch / 2,
            radius: 20,
            speed: 0.1,
            angle: 0,
            draw: function () {
                // thisRef.ctx.strokeStyle = 'hsla(' + this.colorAngle + ',100%,50%,1)';
                thisRef.ctx.strokeStyle = 'rgb(140,76,76)';
                thisRef.ctx.lineWidth = this.size;
                thisRef.ctx.beginPath();
                thisRef.ctx.moveTo(0, 0);
                thisRef.ctx.lineTo(this.x, 100);
                thisRef.ctx.stroke();
            },
            update: function () {
                // this.colorAngle = 0;
                // this.x = this.centerX + Math.sin(3.14 * -1) * this.radius;
                // this.y = this.centerY + Math.cos(3.14 * -1) * this.radius;
                this.x += this.speed;
            }
        };
    }

    loop() {
        window.myRequestAnimFrameCall(() => {this.loop()});
        this.ctx.fillStyle = 'rgb(238,238,238)';
        this.ctx.fillRect(0, 0, this.cw, this.ch);

        let updateCount = 3;
        while (updateCount--) {
            this.obj.update();
            this.obj.draw();
        }
    }

}