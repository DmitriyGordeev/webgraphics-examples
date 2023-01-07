import * as THREE from 'three';
import {DragControls} from 'three/addons/controls/DragControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {getFragmentShader} from "./fluid2Dshader";
import {getLiquidShader} from "./liquidShader";
import {OrbitControls} from "three/addons/controls/OrbitControls";

/**
 * This is example of how to take previous frame as a texture and use it again:
 * example uses 3 channels (3 THREEJS scenes)
 * the first 2 are bind together and uses each other's render results a texture, e.g.
 * render result of the 1st shader is used as sampler2D texture in the second shader and vice-versa
 * The third one finally renders to canvas and uses the texture from the second shader as well
 */



const planeWidth = 30;


let mouseDown = false;
let mouseX = 0;
let mouseY = 0;
let mouseDistanceX = 0;
let mouseDistanceY = 0;
let mouseLastDistanceX = 0;
let mouseLastDistanceY = 0;
let mouseSpeedX = 0;
let mouseSpeedY = 0;
let cameraClosingSpeed = 0;


const BottleState = {CLOSE: 0, OPEN: 1, PRESENTED: 2, READY: 3};

let AnimProps = {
    restranslated: false,
    timelagOpenPresentedMs: 1500
};

export class ThreeShader2Channels {
    constructor() {
        this.setupFrameCallback();
        this.canvas = document.getElementById('c');
        this.scale();
        this.clock = new THREE.Clock();

        this.actors = [];
        this.bottleState = BottleState.CLOSE;

        this.renderTarget1 = new THREE.WebGLRenderTarget(this.cw, this.ch);
        this.renderTarget2 = new THREE.WebGLRenderTarget(this.cw, this.ch);

        /* mouse events  */
        // TODO: mouse events for mobile will be touch events
        window.addEventListener('mousedown', (e) => {
            mouseDown = true;
            console.log(e);
            mouseX = e.screenX;
            mouseY = e.screenY;
        });

        window.addEventListener('mouseup', (e) => {
            mouseDown = false;
            mouseDistanceX = 0;
            mouseSpeedX = 0;
            mouseLastDistanceX = 0;

            mouseDistanceY = 0;
            mouseSpeedY = 0;
            mouseLastDistanceY = 0;
        });

        window.addEventListener('mousemove', (e) => {
            if (mouseDown) {
                mouseDistanceX = e.screenX - mouseX;
                mouseDistanceY = e.screenY - mouseY;
                mouseSpeedX = mouseDistanceX - mouseLastDistanceX;
                mouseSpeedY = mouseDistanceY - mouseLastDistanceY;
                mouseLastDistanceX = mouseDistanceX;
                mouseLastDistanceY = mouseDistanceY;
            }
        });
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

        this.uniforms1.u_time.value = this.clock.getElapsedTime();
        this.uniforms2.u_time.value = this.clock.getElapsedTime();
        this.uniforms3.u_time.value = this.clock.getElapsedTime();

        // closing in the camera while rotating the cap
        if (this.bottleState !== BottleState.READY) {
            this.camera.position.z -= mouseSpeedX / 500;
        }

        // Object animation when use mouse
        let cap = this.actors[1];

        let capElevation = 4.4;     // any number to trigger the liquid shader
        if (this.bottleState === BottleState.CLOSE) {

            cap.position.y += mouseSpeedX / 5000;
            if (cap.position.y <= 4.3) {
                cap.position.y = 4.3;
            }
            else
                cap.rotation.y += mouseSpeedX / 100;

            capElevation = cap.position.y;
        }

        console.log(`capElevation = ${capElevation}`);

        // bottle rotation
        let bottle = this.actors[0];
        let shaderAnimStartPos = 4.4;
        if (capElevation < shaderAnimStartPos) {
            // bottle.rotation.x -= mouseSpeedX / 700;
            // bottle.position.y -= mouseSpeedX / 400;

        } else if (this.bottleState === BottleState.CLOSE) {
            this.bottleState = BottleState.OPEN;
        }

        if (this.bottleState === BottleState.OPEN) {
            bottle.position.y -= 0.03;
            if (bottle.position.y <= -10) {
                bottle.position.y = -10.0;
            }
            cap.position.x += 0.01;
            cap.position.y += 0.02;
            cap.rotation.z += 0.05;

            if (!AnimProps.restranslated) {
                let thisref = this;
                AnimProps.restranslated = true;     // this flag needs to invoke setTimeout only once
                setTimeout(() => {
                    thisref.bottleState = BottleState.PRESENTED;

                    bottle.position.set(0, 0, 0);
                    cap.position.set(0, 4.36, 0);
                    cap.rotation.z = 0.0;

                    thisref.bottleCapGroup.scale.set(0.85, 0.85, 0.85);
                    thisref.bottleCapGroup.position.set(-3, -8, 0);
                    thisref.bottleCapGroup.rotation.y = Math.PI / 12.0;

                }, AnimProps.timelagOpenPresentedMs);
            }

        } else if (this.bottleState === BottleState.PRESENTED) {

            console.log(`this.wrapper.position.y = ${this.bottleCapGroup.position.y}`);
            if (this.bottleCapGroup.position.y < -1.0) {
                this.bottleCapGroup.position.y += 0.06;
            }
            else {
                // Once it is set we can allow to rotate object group
                this.bottleState = BottleState.READY;
            }
        }


        // If state is READY, we allow to rotate the object group
        if (this.bottleState === BottleState.READY) {
            this.bottleCapGroup.rotation.x += mouseSpeedY * 0.01;
            this.bottleCapGroup.rotation.y += mouseSpeedX * 0.01;
        }



        this.uniforms1.u_cubeElevation.value = capElevation;
        this.uniforms2.u_cubeElevation.value = capElevation;

        this.renderScene();
    }


    startScene() {

        let canvas = this.canvas;
        this.renderer = new THREE.WebGLRenderer({canvas, alpha: true, antialias: true });
        // this.renderer = new THREE.WebGLRenderer({canvas, alpha: true});
        this.renderer.setClearColor("#000000");
        this.renderer.setPixelRatio(1.0);
        console.log(`window.devicePixelRatio = ${window.devicePixelRatio}`);
        this.renderer.setSize(this.cw, this.ch);

        this.aspect = this.canvas.width / this.canvas.height;

        this.scene1 = new THREE.Scene();
        this.scene2 = new THREE.Scene();
        this.scene3 = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(40, this.aspect);

        // // Orthographic camera
        // let viewSize = 8;
        // this.camera = new THREE.OrthographicCamera(
        //     (-this.aspect * viewSize) / 2,
        //     (this.aspect * viewSize) / 2,
        //     viewSize / 2,
        //     -viewSize / 2,
        //     -1000,
        //     1000,
        // );

        this.camera.position.set(0, 0, 11);
        this.camera.lookAt(0, 0, 0);

        this.scene1.add(this.camera);
        this.scene2.add(this.camera);
        this.scene3.add(this.camera);

        // Add point light to the scene3
        // const light = new THREE.PointLight( 0xffffff, 5, 20 );
        // light.position.set( 0, 10, 8 );
        // this.scene3.add( light );

        const light = new THREE.AmbientLight(0xffffff); // soft white light
        this.scene3.add(light);
    }


    createPlane1() {

        this.uniforms1 = {
            u_time: {type: 'f', value: 0.0},
            u_texture: {type: 't', value: this.renderTarget2.texture},
            u_noise: {type: 't', value: this.noiseTexture},
            u_screenSize: {type: 'v2', value: new THREE.Vector2(this.cw, this.ch)},
            u_cubeElevation: {type: 'f', value: 0.0}
        };

        let vertexShader = `
                uniform float u_time;
                uniform vec2 u_screenSize;
                varying vec3 vPos;
                attribute float size;
                varying vec2 vUV;
                
                void main() {
                    vPos = position;
                    vUV = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }
        `;

        let fragmentShader = getLiquidShader();

        const shaderMaterial = new THREE.ShaderMaterial({
            uniforms: this.uniforms1,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,

            // blending: THREE.AdditiveBlending,
            // depthTest: false,
            // transparent: true,
            // vertexColors: true
        });

        let planeHeight = planeWidth / this.aspect;
        const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);

        this.plane1 = new THREE.Mesh(geometry, shaderMaterial);
        this.plane1.rotation.y = 0.0;
        this.plane1.rotation.x = 0.0;
        this.scene1.add(this.plane1);
        // this.actors.push(this.plane1);
    }


    createPlane2() {

        this.uniforms2 = {
            u_time: {type: 'f', value: 0.0},
            u_texture: {type: 't', value: this.renderTarget1.texture},
            u_noise: {type: 't', value: this.noiseTexture},
            u_screenSize: {type: 'v2', value: new THREE.Vector2(this.cw, this.ch)},
            u_cubeElevation: {type: 'f', value: 0.0}
        };

        let vertexShader = `
                uniform float u_time;
                uniform vec2 u_screenSize;
                varying vec3 vPos;
                attribute float size;
                varying vec2 vUV;
                
                void main() {
                    vPos = position;
                    vUV = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }
            `;

        // SHADER 2
        let fragmentShader = getLiquidShader();


        const shaderMaterial = new THREE.ShaderMaterial({
            uniforms: this.uniforms2,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,

            // blending: THREE.AdditiveBlending,
            // depthTest: false,
            // transparent: true,
            // vertexColors: true
        });

        let planeHeight = planeWidth / this.aspect;
        const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);

        this.plane2 = new THREE.Mesh(geometry, shaderMaterial);
        this.plane2.rotation.y = 0.0;
        this.plane2.rotation.x = 0.0;
        this.scene2.add(this.plane2);
        // this.actors.push(this.plane2);
    }


    createPlane3() {
        this.uniforms3 = {
            u_time: {type: 'f', value: 0.0},
            u_texture: {type: 't', value: this.renderTarget2.texture},
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


        // SHADER 3
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
            uniforms: this.uniforms3,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,

            // blending: THREE.AdditiveBlending,
            // depthTest: false,
            // transparent: true,
            // vertexColors: true
        });

        let planeWidth3 = 35;
        let planeHeight = planeWidth3 / this.aspect;
        const geometry = new THREE.PlaneGeometry(planeWidth3, planeHeight);

        this.plane3 = new THREE.Mesh(geometry, shaderMaterial);
        this.plane3.position.z = -10.0;
        this.plane3.rotation.y = 0.0;
        this.plane3.rotation.x = 0.0;
        this.scene3.add(this.plane3);
        // this.actors.push(this.plane3);
    }


    createCube() {
        let cubeMaterials = [
            new THREE.MeshBasicMaterial({color: 0x2173fd}),
            new THREE.MeshBasicMaterial({color: 0xd5d918}),
            new THREE.MeshBasicMaterial({color: 0xd2dbeb}),
            new THREE.MeshBasicMaterial({color: 0xa3a3c6}),
            new THREE.MeshBasicMaterial({color: 0x330000}),
            new THREE.MeshBasicMaterial({color: 0x856af9})
        ];

        let cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
        this.cube = new THREE.Mesh(cubeGeometry, cubeMaterials);

        this.cube.position.x = 0.0;
        this.cube.position.y = -3.0;
        this.cube.position.z = -3.0;
        this.cube.rotation.y = Math.PI / 3.0;

        // this.scene3.add(this.cube);
        this.actors.push(this.cube);
    }


    renderScene() {
        this.renderer.setRenderTarget(this.renderTarget1);
        this.renderer.render(this.scene1, this.camera);

        // assign the output of the first render to the second scene
        this.uniforms2.u_texture.value = this.renderTarget1.texture;


        // Now we render the second scene
        this.renderer.setRenderTarget(this.renderTarget2);
        this.renderer.render(this.scene2, this.camera);

        // and assign it's output to the first and third scenes
        this.uniforms1.u_texture.value = this.renderTarget2.texture;
        this.uniforms3.u_texture.value = this.renderTarget2.texture;

        // Finally render 3ed scene
        this.renderer.setRenderTarget(null);
        this.renderer.render(this.scene3, this.camera);
    }


    // entry() {
    //
    //     const loader = new THREE.TextureLoader();
    //     let thisref = this;
    //
    //     // load a resource
    //     loader.load(
    //         // resource URL
    //         'textures/noise.jpg',
    //
    //         // onLoad callback
    //         function (texture) {
    //             // in this example we create the material when the texture is loaded
    //             thisref.noiseTexture = texture;
    //             thisref.startScene();
    //
    //             thisref.createPlane1();
    //             thisref.createPlane2();
    //             thisref.createPlane3();
    //
    //             thisref.createCube();
    //
    //             window.addEventListener('keydown', () => {
    //                 console.log("keyDown");
    //             }, true);
    //
    //             window.addEventListener('keyup', () => {
    //                 console.log("keyUp");
    //             }, true);
    //
    //             thisref.animateScene([thisref.actors]);
    //             thisref.renderScene();
    //         },
    //
    //         // onProgress callback currently not supported
    //         undefined,
    //
    //         // onError callback
    //         function (err) {
    //             console.error('An error happened.');
    //         }
    //     );
    // }


    entry() {
        let thisref = this;
        const loader = new GLTFLoader().setPath('models/');

         this.bottleCapGroup = new THREE.Object3D();

        // Loading bottle.gltf model
        let promise = new Promise((resolve, reject) => {
            loader.load('bottle.gltf', function (gltf) {
                let bottle = gltf.scene;
                thisref.bottleCapGroup.add(bottle);

                // bottle.position.y = -5.0;
                // bottle.position.z = -7.0;

                thisref.actors.push(bottle);
                resolve();
            });
        });

        // loading cap -> then -> setup scene
        promise.then(() => {
            return new Promise((resolve) => {
                loader.load('cap.gltf', function (gltf) {
                    let cap = gltf.scene;
                    thisref.bottleCapGroup.add(cap);

                    cap.position.y = 4.36;
                    // cap.position.z = 7.0;

                    thisref.actors.push(cap);
                    resolve();
                });
            });
        }).then(() => {

            thisref.startScene();

            thisref.createPlane1();
            thisref.createPlane2();
            thisref.createPlane3();

            // add all the actors to scene3
            // console.log(`actors.length = ${thisref.actors.length}`);
            // for (let i = 0; i < thisref.actors.length; i++) {
            //     thisref.scene3.add(thisref.actors[i]);
            // }

            // create a 3D object wrapper (nesting bottle and cap together to apply single transform)
            // thisref.bottleCapGroup = new THREE.Object3D();
            // thisref.bottleCapGroup.add(thisref.actors[0]);
            // thisref.bottleCapGroup.add(thisref.actors[1]);
            // thisref.scene3.add(thisref.bottleCapGroup);

            thisref.bottleCapGroup.position.set(0, -5, 7);
            thisref.scene3.add(thisref.bottleCapGroup);

            thisref.animateScene(thisref.actors);
            thisref.renderScene();
        });
    }





}
