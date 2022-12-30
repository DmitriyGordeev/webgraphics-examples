import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js';

const WIDTH = 32;
const BOUNDS = 255, BOUNDS_HALF = BOUNDS / 2;


export class GPGPUExample {
    constructor() {
        this.setupFrameCallback();
        this.canvas = document.getElementById('c');
        this.scale();
        this.clock = new THREE.Clock();
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
    }


    animateScene() {
        window.customRequestAnimationFrame(() => {
            this.animateScene()
        });

        this.renderScene();
    }


    setupScene() {
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
            u_texture: {type: 't', value: null},
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
                    
                    vec4 color = texture(u_texture, uv);
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
        this.plane.position.z = -2.5;
        this.plane.rotation.y = 0.0;
        this.plane.rotation.x = 0.0;
        this.scene.add(this.plane);
    }


    createGPGPU() {
        this.gpuCompute = new GPUComputationRenderer( WIDTH, WIDTH, this.renderer);

        // if (this.renderer.capabilities.isWebGL2 === false) {
        //     this.gpuCompute.setDataType( THREE.HalfFloatType );
        // }
        // else {
        //     alert(this.renderer.capabilities.isWebGL2);
        // }

        const gpuTexture = this.gpuCompute.createTexture();

        // fill texture with some data
        const theArray = gpuTexture.image.data;
        for ( let k = 0, kl = theArray.length; k < kl; k += 4 ) {
            const x = Math.random() * BOUNDS - BOUNDS_HALF;
            const y = Math.random() * BOUNDS - BOUNDS_HALF;
            const z = Math.random() * BOUNDS - BOUNDS_HALF;
            theArray[ k + 0 ] = x;
            theArray[ k + 1 ] = y;
            theArray[ k + 2 ] = z;
            theArray[ k + 3 ] = 1;
        }


        let fragmentShader = `
            uniform vec2 u_screenSize;
            uniform float u_time;
            
            void main() {
                vec2 uv = gl_FragCoord.xy / 32.0;
                vec4 tex = texture(u_texture, uv);
                  
                if (uv.x > 0.5) {
                    tex.r = 1.0;
                    tex.g = 1.0;
                    tex.b = 1.0;
                }
                
                gl_FragColor = tex;
            }
        `;

        this.positionVariable = this.gpuCompute.addVariable(
            'u_texture',
            fragmentShader, // document.getElementById( 'fragmentShaderPosition' ).textContent,
            gpuTexture);

        // ???
        this.gpuCompute.setVariableDependencies( this.positionVariable,
            [ this.positionVariable ] );

        this.positionUniforms = this.positionVariable.material.uniforms;
        this.positionUniforms[ 'u_time' ] = { value: 0.0 };

        this.positionVariable.wrapS = THREE.RepeatWrapping;
        this.positionVariable.wrapT = THREE.RepeatWrapping;

        const error = this.gpuCompute.init();
        if ( error !== null ) {
            console.error( error );
        }
    }




    renderScene() {
        this.uniforms.u_time.value = this.clock.getElapsedTime();
        this.positionUniforms.u_time.value = this.clock.getElapsedTime();

        this.gpuCompute.compute();

        this.uniforms.u_texture.value = this.gpuCompute.getCurrentRenderTarget( this.positionVariable ).texture;

        // render the scene users see as normal
        this.renderer.render(this.scene, this.camera);
    }


    entry() {
        this.setupScene();
        this.createPlane();
        this.createGPGPU();
        this.animateScene();
        this.renderScene();
    }
}
