

export class TrailsAnim {
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

    start() {
        let rand = function (rMi, rMa) {
            return ~~((Math.random() * (rMa - rMi + 1)) + rMi);
        }

        this.ctx.lineCap = 'round';      // the line's endpoint (round)
        let orbs = [];
        let orbCount = 30;
        let radius;

        let thisRef = this;

        function createOrb(mx, my) {
            let dx = (thisRef.cw / 2) - mx;
            let dy = (thisRef.ch / 2) - my;
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
                centerX: thisRef.cw / 2,
                centerY: thisRef.ch / 2,
                radius: dist,
                speed: (rand(5, 10) / 1000) * (dist / 750) + .015,
                alpha: 1 - Math.abs(dist) / thisRef.cw,
                draw: function () {
                    thisRef.ctx.strokeStyle = 'hsla(' + this.colorAngle + ',100%,50%,1)';
                    thisRef.ctx.lineWidth = this.size;
                    thisRef.ctx.beginPath();
                    thisRef.ctx.moveTo(this.lastX, this.lastY);
                    thisRef.ctx.lineTo(this.x, this.y);
                    thisRef.ctx.stroke();
                },
                update: function () {
                    let mx = this.x;
                    let my = this.y;
                    this.lastX = this.x;
                    this.lastY = this.y;
                    let x1 = thisRef.cw / 2;
                    let y1 = thisRef.ch / 2;
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
            let mx = e.pageX - this.c.offsetLeft;
            let my = e.pageY - this.c.offsetTop;
            createOrb(mx, my);
        }

        function turnOnMove() {
            this.c.addEventListener('mousemove', orbGo, false);
        }

        function turnOffMove() {
            this.c.removeEventListener('mousemove', orbGo, false);
        }

        this.c.addEventListener('mousedown', orbGo, false);
        this.c.addEventListener('mousedown', turnOnMove, false);
        this.c.addEventListener('mouseup', turnOffMove, false);

        let count = 100;
        while (count--) {
            createOrb(this.cw / 2, this.ch / 2 + (count * 2));
        }

        let loop = function () {
            window.myRequestAnimFrameCall(loop);

            thisRef.ctx.fillStyle = 'rgba(0,0,0,.1)';
            thisRef.ctx.fillRect(0, 0, thisRef.cw, thisRef.ch);

            let i = orbs.length;
            while (i--) {
                let orb = orbs[i];
                let updateCount = 3;
                while (updateCount--) {
                    orb.update();
                    orb.draw();
                }
            }
        }

        loop();
    }

}