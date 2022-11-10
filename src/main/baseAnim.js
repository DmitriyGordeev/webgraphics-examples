

export class BaseAnim {
    constructor() {
        this.setupFrameCallback();
        this.c = document.getElementById('c');
        this.ctx = this.c.getContext('2d');
        this.scale();
    }

    setupFrameCallback() {
        window.myRequestAnimFrameCall = function () {
            return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (a) {
                window.setTimeout(a, 1E3 / 60)
            }
        }();

        document.onselectstart = function () {
            return false;
        };
    }

    scale() {
        this.dpr = window.devicePixelRatio;
        this.cw = window.innerWidth;
        this.ch = window.innerHeight;
        this.c.width = this.cw * this.dpr;
        this.c.height = this.ch * this.dpr;
        this.ctx.scale(this.dpr, this.dpr);
    }
}