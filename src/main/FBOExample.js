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
        this.uniforms.u_time.value = this.clock.getElapsedTime();

        this.renderScene();
    }


    startScene() {
        let canvas = this.canvas;
        this.renderer = new THREE.WebGLRenderer({canvas, alpha: true, antialias: true });
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

        let planeWidth3 = 35;
        let planeHeight = planeWidth3 / this.aspect;
        const geometry = new THREE.PlaneGeometry(planeWidth3, planeHeight);

        this.plane3 = new THREE.Mesh(geometry, shaderMaterial);
        this.plane3.position.z = -10.0;
        this.plane3.rotation.y = 0.0;
        this.plane3.rotation.x = 0.0;
        this.scene.add(this.plane3);
    }


    renderScene() {
        // this.renderer.setRenderTarget(this.renderTarget1);
        // this.renderer.render(this.scene1, this.camera);
        //
        // // assign the output of the first render to the second scene
        // this.uniforms2.u_texture.value = this.renderTarget1.texture;


        // // Now we render the second scene
        // this.renderer.setRenderTarget(this.renderTarget2);
        // this.renderer.render(this.scene2, this.camera);
        //
        // // and assign it's output to the first and third scenes
        // this.uniforms1.u_texture.value = this.renderTarget2.texture;
        // this.uniforms3.u_texture.value = this.renderTarget2.texture;

        // Finally render 3ed scene
        this.renderer.setRenderTarget(null);
        this.renderer.render(this.scene, this.camera);
    }


    entry() {
        this.startScene();
        this.createPlane();
        this.animateScene();
        this.renderScene();
    }
}
