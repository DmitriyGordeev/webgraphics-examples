
/* This is basic 3D animation class which we can extend to our own class with own logics
    Implements:
    1. window.requestAnimationFrame for multiple browsers
    2. scales resolution of viewport with scale()
* */
export class BaseAnim3D {
    constructor() {
        this.setupFrameCallback();
        this.ctx = null;
        this.canvas = document.getElementById('c');
        this.webGlSupport();
        // this.scale();

        // TODO: что если взять одновременно 2d и 3d контексты?
        // this.ctx = this.canvas.getContext('3d');
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

    webGlSupport() {
        let webgl = this.canvas.getContext('webgl')
            || this.canvas.getContext('experimental-webgl');

        if (!webgl || !(webgl instanceof WebGLRenderingContext) ) {
            // browser doesn't support WebGL
            console.log("Couldn't get WebGL context, does browser support WebGL ?");
            return false;
        }

        console.log("Successfully get WebGL context");
        this.ctx = webgl;
        return true;
    }

    scale() {
        this.dpr = window.devicePixelRatio;
        this.cw = window.innerWidth;
        this.ch = window.innerHeight;
        this.canvas.width = this.cw * this.dpr;
        this.canvas.height = this.ch * this.dpr;
        this.ctx.scale(this.dpr, this.dpr);
    }


    /**
     * Creates the vertex buffer, binds it, passes the vortex data to it,
     * and sets the color.
     */
    initWebGL(vortexes) {
        let vertexBuffer = this.ctx.createBuffer();
        this.ctx.bindBuffer(webgl.ARRAY_BUFFER, vertexBuffer);

        this.ctx.bufferData(
            this.ctx.ARRAY_BUFFER,
            new Float32Array(vortexes),
            this.ctx.STATIC_DRAW
        );

        this.ctx.clearColor(0, 0.5, 0.5, 0.9);
        this.ctx.clear(this.ctx.COLOR_BUFFER_BIT);
    }


    /**
     * Creates the vertex shader object from the source code defined in
     * 2_vertex_shader.js.
     */
    createVertexShader() {
        let vertexShader = this.ctx.createShader(this.ctx.VERTEX_SHADER);
        this.ctx.shaderSource(vertexShader, vertexCode);
        this.ctx.compileShader(vertexShader);
        return vertexShader;
    }


    /**
     * Creates the fragment shader object from the source code defined in
     * 2_vertex_shader.js.
     */
    createFragmentShader() {
        let fragmentShader = this.ctx.createShader(this.ctx.FRAGMENT_SHADER);
        this.ctx.shaderSource(fragmentShader, fragmentCode);
        this.ctx.compileShader(fragmentShader);
        return fragmentShader;
    }


    /**
     * Create and attach the shader programs from the shader compiled objects.
     */
    createShaderProgram(vertexShader, fragmentShader) {
        let shaderProgram = this.ctx.createProgram();
        this.ctx.attachShader(shaderProgram, vertexShader);
        this.ctx.attachShader(shaderProgram, fragmentShader);
        this.ctx.linkProgram(shaderProgram);
        this.ctx.useProgram(shaderProgram);
        return shaderProgram;
    }


    /**
     * Gets and sets the coordinates associating the compiled shader programs
     * to buffer objects.
     */
    transformCoordinatesAndSet(shaderProgram) {
        let coordinates = this.ctx.getAttribLocation(
            shaderProgram,
            'coordinates'
        );
        this.ctx.vertexAttribPointer(
            coordinates,
            2,
            this.ctx.FLOAT,
            false,
            0,
            0
        );
        this.ctx.enableVertexAttribArray(coordinates);
    }

    /**
     * Draws the arrays.
     */
    drawArrays() {
        this.ctx.drawArrays(this.ctx.TRIANGLES, 0, 3);
    }


    draw() {
        let vortexes = [
            0.8, 0.0,
            0.0, 1,
            1, 0.8
        ];

        if (this.ctx) {
            this.initWebGL(vortexes);
            let vertexShader = this.createVertexShader();
            let fragmentShader = this.createFragmentShader();

            let shaderProgram = this.createShaderProgram(vertexShader, fragmentShader);
            this.transformCoordinatesAndSet(shaderProgram);
            this.drawArrays();
        }
    }


}