import {BaseAnim} from "./baseAnim";


export class CustomAnim extends BaseAnim {
    constructor() {
        super();
    }

    loop = () => {
        window.myRequestAnimFrameCall(this.loop);
        this.ctx.fillStyle = 'rgba(0,0,0,.1)';
        this.ctx.fillRect(0, 0, this.cw, this.ch);

        // let i = orbs.length;
        // while (i--) {
        //     let orb = orbs[i];
        //     let updateCount = 3;
        //     while (updateCount--) {
        //         orb.update();
        //         orb.draw();
        //     }
        // }
    }

}