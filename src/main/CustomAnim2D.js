import {BaseAnim2D} from "./baseAnim";


export class CustomAnim extends BaseAnim2D {
    constructor() {
        super();

        let thisRef = this;

        // Adding some object with some properties and functions:
        // draw() and update() to apply canvas drawing
        this.obj = {
            x: 60,
            y: 60,
            speed: 0.1,
            size: 30,

            draw: function () {
                thisRef.ctx.beginPath();

                // thisRef.ctx.moveTo(0, 0);
                // thisRef.ctx.lineTo(this.x, 100);

                // thisRef.ctx.arc(100, 75, 50, 33, (2 - 0.1) * Math.PI);
                // thisRef.ctx.rect(100, 100, 20, 20);

                thisRef.ctx.ellipse(this.x, 100, 20, 30, 0, 0, 2 * Math.PI);
                thisRef.ctx.fillStyle = 'rgb(140,76,76)';
                thisRef.ctx.strokeStyle = 'rgb(140,76,76)';
                thisRef.ctx.lineWidth = this.size;

                thisRef.ctx.stroke();       // apply strokeStyle
                thisRef.ctx.fill();         // apply fillStyle
            },
            update: function () {
                this.x += this.speed;
                this.size += this.speed * 0.25;
            }
        };
    }

    loop() {
        window.myRequestAnimFrameCall(() => {this.loop()});     // the next frame calls the same method
                                                                // which creates inf loop
        this.ctx.fillStyle = 'rgb(238,238,238)';
        this.ctx.fillRect(0, 0, this.cw, this.ch);

        this.obj.update();
        this.obj.draw();

        // let updateCount = 3;
        // while (updateCount--) {
        //     this.obj.update();
        //     this.obj.draw();
        // }
    }

}