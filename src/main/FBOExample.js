import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {getLiquidShader} from "./liquidShader";


export class FBOExample {
    constructor() {
        this.setupFrameCallback();
        this.canvas = document.getElementById('c');
        this.scale();
        this.clock = new THREE.Clock();

        this.actors = [];
        // this.renderTarget1 = new THREE.WebGLRenderTarget(this.cw, this.ch);
        // this.renderTarget2 = new THREE.WebGLRenderTarget(this.cw, this.ch);
    }


    setupFrameCallback() {
        window.customRequestAnimationFrame = function () {
            return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (a) {
                window.setTimeout(a, 1E3 / 60)
            }
        }();
    }


    scale() {
        this.cw = window.innerWidth;
        this.ch = window.innerHeight;

        console.log(`this.cw = ${this.cw}, this.ch = ${this.ch}`);
    }


    animateScene() {
        window.customRequestAnimationFrame(() => {
            this.animateScene(this.actors)
        });

        // this.uniforms1.u_time.value = this.clock.getElapsedTime();
        // this.uniforms2.u_time.value = this.clock.getElapsedTime();
        // this.uniforms.u_time.value = this.clock.getElapsedTime();

        this.renderScene();
    }


    startScene() {
        let canvas = this.canvas;
        this.renderer = new THREE.WebGLRenderer({canvas, alpha: true, antialias: true});
        this.renderer.setClearColor("#000000");
        this.renderer.setPixelRatio(1.0);
        this.renderer.setSize(this.cw, this.ch);

        this.aspect = this.canvas.width / this.canvas.height;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(40, this.aspect);

        this.camera.position.set(0, 0, 11);
        this.camera.lookAt(0, 0, 0);
        this.scene.add(this.camera);

        const light = new THREE.AmbientLight(0xffffff); // soft white light
        this.scene.add(light);
    }


    createPlane() {
        this.uniforms = {
            u_time: {type: 'f', value: 0.0},
            u_screenSize: {type: 'v2', value: new THREE.Vector2(this.cw, this.ch)}
        };

        let vertexShader = `
                uniform float u_time;
                uniform vec2 u_screenSize;
                attribute float size;
     
                out vec2 vUV;
                
                void main() {
                    vUV = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }
            `;


        let fragmentShader = `
                uniform vec2 u_screenSize;
                uniform float u_time;
                uniform sampler2D u_texture;    // this texture holds rendering from shader 2 (scene2)
               
                in vec2 vUV;
                
                void main() {
                    vec2 uv = gl_FragCoord.xy / u_screenSize.xy;    // for clipping shader with plane area
                    // vec2 uv = vUV;                               // for texturzing the plane
                    
                    // vec4 color = texture(u_texture, uv);
                    vec4 color = vec4(0.1, 0.2, 0.6, 1.0);
                    gl_FragColor = color;
                }
            `;


        const shaderMaterial = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        });

        let planeWidth3 = 20;
        let planeHeight = planeWidth3 / this.aspect;
        const geometry = new THREE.PlaneGeometry(planeWidth3, planeHeight);

        this.plane = new THREE.Mesh(geometry, shaderMaterial);
        this.plane.position.z = -10.0;
        this.plane.rotation.y = 0.0;
        this.plane.rotation.x = 0.0;
        this.scene.add(this.plane);
    }


    createFBO() {
        /**
         * OES_texture_float extension has huge problem of browser support ?
         * Double check
         */

        console.log(this.renderer.getContext().getSupportedExtensions());

        // verify browser agent supports "frame buffer object" features
        let gl = this.renderer.getContext();
        if (!gl.getExtension('OES_texture_float') ||
            gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) === 0) {
            alert('createFBO(): Cannot create FBO');
        }

        console.log(gl.checkFramebufferStatus);

        // set initial positions of `w*h` particles
        let w = 256;
        let h = 256;
        let i = 0;
        let data = new Float32Array(w * h * 4);
        for (let x = 0; x < w; x++) {
            for (let y = 0; y < h; y++) {
                data[i++] = x / w;
                data[i++] = y / h;
                data[i++] = 0;
                data[i++] = 1.0;
            }
        }

        // feed those positions into a data texture
        let dataTex = new THREE.DataTexture(data, w, h, THREE.RGBAFormat, THREE.FloatType);
        dataTex.minFilter = THREE.NearestFilter;
        dataTex.magFilter = THREE.NearestFilter;
        dataTex.needsUpdate = true;

        let simVS = `
            precision mediump float;
            uniform mat4 projectionMatrix;
            uniform mat4 modelViewMatrix;
            
            attribute vec2 uv; // x,y offsets of each point in texture
            attribute vec3 position;
            varying vec2 vUv;
            
            void main() {
                vUv = vec2(uv.x, 1.0 - uv.y);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }`;

        let simFS = `
            precision mediump float;
            uniform sampler2D posTex;
            varying vec2 vUv;
            void main() {
                // read the supplied x,y,z vert positions
                vec3 pos = texture2D(posTex, vUv).xyz;
                
                // update the positional attributes here!
                pos.x += cos(pos.y) / 100.0;
                pos.y += tan(pos.x) / 100.0;
                
                // render the new positional attributes
                // gl_FragColor = vec4(pos, 1.0);
                gl_FragColor = vec4(1.0);
            }`;

        this.simUniforms = {posTex: {type: 't', value: dataTex}};

        // add the data texture with positions to a material for the simulation
        let simMaterial = new THREE.RawShaderMaterial({
            uniforms: this.simUniforms,
            vertexShader: simVS,
            fragmentShader: simFS
        });
        // delete dataTex; it isn't used after initializing point positions
        // delete dataTex;


        let s = function (w, simMat) {
            this.scene2 = new THREE.Scene();
            this.camera = new THREE.OrthographicCamera(-w / 2, w / 2, w / 2, -w / 2, -1, 1);
            this.scene2.add(new THREE.Mesh(new THREE.PlaneGeometry(w, w), simMat));
        };

        // create a scene where we'll render the positional attributes
        this.fbo = new s(w, simMaterial);

        // create render targets a + b to which the simulation will be rendered
        this.renderTargetA = new THREE.WebGLRenderTarget(w, h, {
            wrapS: THREE.RepeatWrapping,
            wrapT: THREE.RepeatWrapping,
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBFormat,
            type: THREE.FloatType,
            stencilBuffer: false,
        });

        // a second render target lets us store input + output positional states
        this.renderTargetB = this.renderTargetA.clone();

        // render the positions to the render targets
        this.renderer.render(this.fbo.scene2, this.fbo.camera, this.renderTargetA, false);
        this.renderer.render(this.fbo.scene2, this.fbo.camera, this.renderTargetB, false);


        // store the uv attrs; each is x,y and identifies a given point's
        // position data within the positional texture; must be scaled 0:1!
        let geo = new THREE.BufferGeometry(),
            arr = new Float32Array(w * h * 3);

        for (let i = 0; i < arr.length; i++) {
            arr[i++] = (i % w) / w;
            arr[i++] = Math.floor(i / w) / h;
            arr[i++] = 0;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(arr, 3, true))

        this.uniforms2 = {posMap: {type: 't', value: null}};

        let vs = `
            precision mediump float;
            uniform sampler2D posMap; // contains positional data read from sim-fs
            uniform mat4 projectionMatrix;
            uniform mat4 modelViewMatrix;
            attribute vec2 position;
            
            void main() {
                // read this particle's position, which is stored as a pixel color
                vec3 pos = texture2D(posMap, position.xy).xyz;
                
                // project this particle
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_Position = projectionMatrix * mvPosition;
                
                // set the size of each particle
                gl_PointSize = 0.3 / -mvPosition.z;
            }`;

        let fs = `
            precision mediump float;
            void main() {
                // gl_FragColor = vec4(0.0, 0.5, 1.5, 1.0);
                gl_FragColor = vec4(1.0);
            }`;

        // create material the user sees
        let material = new THREE.RawShaderMaterial({
            uniforms: this.uniforms2,
            vertexShader: vs,
            fragmentShader: fs,
            // vertexShader: document.querySelector('#ui-vert').textContent,
            // fragmentShader: document.querySelector('#ui-frag').textContent,
            transparent: true,
        });

        // add the points the user sees to the scene
        let mesh = new THREE.Points(geo, material);
        this.scene.add(mesh);
    }


    renderScene() {
        // // finally render 3ed scene
        // this.renderer.setRenderTarget(null);
        // this.renderer.render(this.scene, this.camera);

        // at the start of the render block, A is one frame behind B
        let oldA = this.renderTargetA; // store A, the penultimate state
        this.renderTargetA = this.renderTargetB; // advance A to the updated state
        this.renderTargetB = oldA; // set B to the penultimate state

        // pass the updated positional values to the simulation
        this.simUniforms.posTex.value = this.renderTargetA.texture;

        // run a frame and store the new positional values in renderTargetB
        this.renderer.render(this.fbo.scene2, this.fbo.camera, this.renderTargetB, false);

        // pass the new positional values to the scene users see
        this.uniforms2.posMap.value = this.renderTargetB.texture;

        // render the scene users see as normal
        this.renderer.render(this.scene, this.camera);
    }


    entry() {
        this.startScene();
        // this.createPlane();
        this.createFBO();
        this.animateScene();
        this.renderScene();
    }
}
