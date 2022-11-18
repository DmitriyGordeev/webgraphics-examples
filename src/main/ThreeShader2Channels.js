import * as THREE from 'three';
import {DragControls} from 'three/addons/controls/DragControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {getFragmentShader} from "./fluid2Dshader";


/**
 * This is example of how to take previous frame as a texture and use it again:
 * example uses 3 channels (3 THREEJS scenes)
 * the first 2 are bind together and uses each other's render results a texture, e.g.
 * render result of the 1st shader is used as sampler2D texture in the second shader and vice-versa
 * The third one finally renders to canvas and uses the texture from the second shader as well
 */



const planeWidth = 10;
const planeHeight = planeWidth;


export class ThreeShader2Channels {
    constructor() {
        this.setupFrameCallback();
        this.canvas = document.getElementById('c');
        this.scale();
        this.clock = new THREE.Clock();

        this.objects = [];

        this.renderTarget1 = new THREE.WebGLRenderTarget(this.cw, this.ch);
        this.renderTarget2 = new THREE.WebGLRenderTarget(this.cw, this.ch);
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


    animateScene(objects) {
        window.customRequestAnimationFrame(() => {
            this.animateScene(objects)
        });

        this.uniforms1.u_time.value = this.clock.getElapsedTime();
        this.uniforms2.u_time.value = this.clock.getElapsedTime();
        this.uniforms3.u_time.value = this.clock.getElapsedTime();
        this.renderScene();
    }


    startScene() {

        let canvas = this.canvas;
        this.renderer = new THREE.WebGLRenderer({canvas});
        this.renderer.setClearColor("#000000");
        this.renderer.setSize(this.cw, this.ch);

        let aspect = this.canvas.width / this.canvas.height;

        this.scene1 = new THREE.Scene();
        this.scene2 = new THREE.Scene();
        this.scene3 = new THREE.Scene();


        this.camera = new THREE.PerspectiveCamera(45, aspect);
        this.camera.position.set(0, 0, 10);
        this.camera.lookAt(0, 0, 0);

        this.scene1.add(this.camera);
        this.scene2.add(this.camera);
        this.scene3.add(this.camera);
    }


    createPlane1() {

        this.uniforms1 = {
            u_time: {type: 'f', value: 0.0},
            u_texture: {type: 't', value: this.renderTarget2.texture},
            u_noise: {type: 't', value: this.noiseTexture},
            u_screenSize: {type: 'v2', value: new THREE.Vector2(window.innerWidth, window.innerHeight)}
        };

        let vertexShader = `
            uniform float u_time;
            uniform vec2 u_screenSize;
            varying vec3 vPos;
            attribute float size;
            
            void main() {
                vPos = position;        
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
            `;

        let fragmentShader = getFragmentShader();


        const shaderMaterial = new THREE.ShaderMaterial({
            uniforms: this.uniforms1,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,

            blending: THREE.AdditiveBlending,
            depthTest: false,
            transparent: true,
            vertexColors: true
        });

        const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);

        // cubeGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
        // cubeGeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
        // cubeGeometry.setAttribute( 'size', new THREE.Float32BufferAttribute(sizes, 1 ).setUsage( THREE.DynamicDrawUsage ) );

        this.plane1 = new THREE.Mesh(geometry, shaderMaterial);
        this.plane1.rotation.y = 0.0;
        this.plane1.rotation.x = 0.0;
        this.scene1.add(this.plane1);
        this.objects.push(this.plane1);
    }


    createPlane2() {

        this.uniforms2 = {
            u_time: {type: 'f', value: 0.0},
            u_texture: {type: 't', value: this.renderTarget1.texture},
            u_noise: {type: 't', value: this.noiseTexture},
            u_screenSize: {type: 'v2', value: new THREE.Vector2(window.innerWidth, window.innerHeight)}
        };

        let vertexShader = `
            uniform float u_time;
            uniform vec2 u_screenSize;
            varying vec3 vPos;
            attribute float size;
            
            void main() {
                vPos = position;        
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
            `;

        // SHADER 2
        let fragmentShader = getFragmentShader();


        const shaderMaterial = new THREE.ShaderMaterial({
            uniforms: this.uniforms2,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,

            blending: THREE.AdditiveBlending,
            depthTest: false,
            transparent: true,
            vertexColors: true
        });

        const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);

        // cubeGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
        // cubeGeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
        // cubeGeometry.setAttribute( 'size', new THREE.Float32BufferAttribute(sizes, 1 ).setUsage( THREE.DynamicDrawUsage ) );

        this.plane2 = new THREE.Mesh(geometry, shaderMaterial);
        this.plane2.rotation.y = 0.0;
        this.plane2.rotation.x = 0.0;
        this.scene2.add(this.plane2);
        this.objects.push(this.plane2);
    }


    createPlane3() {
        this.uniforms3 = {
            u_time: {type: 'f', value: 0.0},
            u_texture: {type: 't', value: this.renderTarget2.texture},
            u_screenSize: {type: 'v2', value: new THREE.Vector2(window.innerWidth, window.innerHeight)}
        };

        let vertexShader = `
            uniform float u_time;
            uniform vec2 u_screenSize;
            attribute float size;
            
            void main() {
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
            `;


        // SHADER 3
        let fragmentShader = `
            uniform vec2 u_screenSize;
            uniform float u_time;
            uniform sampler2D u_texture;    // this texture holds rendering from shader 2 (scene2)
            
            void main() {
                vec2 uv = gl_FragCoord.xy / u_screenSize.xy;  
                
                // simply passing texture from 2nd render here
                gl_FragColor =  texture(u_texture, uv);
            }
            `;


        const shaderMaterial = new THREE.ShaderMaterial({
            uniforms: this.uniforms3,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,

            blending: THREE.AdditiveBlending,
            depthTest: false,
            transparent: true,
            vertexColors: true
        });

        const geometry = new THREE.PlaneGeometry(7, 7);

        // cubeGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
        // cubeGeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
        // cubeGeometry.setAttribute( 'size', new THREE.Float32BufferAttribute(sizes, 1 ).setUsage( THREE.DynamicDrawUsage ) );

        this.plane3 = new THREE.Mesh(geometry, shaderMaterial);
        this.plane3.rotation.y = 0.0;
        this.plane3.rotation.x = 0.0;
        this.scene3.add(this.plane3);
        this.objects.push(this.plane3);
    }


    renderScene() {
        this.renderer.setRenderTarget(this.renderTarget1);
        this.renderer.render(this.scene1, this.camera);

        // assign the output of the first render to the second shader
        this.uniforms2.u_texture.value = this.renderTarget1.texture;


        // Now we render the second shader
        this.renderer.setRenderTarget(this.renderTarget2);
        this.renderer.render(this.scene2, this.camera);

        // and assign it's output to the first and third shaders
        this.uniforms1.u_texture.value = this.renderTarget2.texture;
        this.uniforms3.u_texture.value = this.renderTarget2.texture;

        // Finally render 3ed shader
        this.renderer.setRenderTarget(null);
        this.renderer.render(this.scene3, this.camera);
    }


    entry() {

        const loader = new THREE.TextureLoader();
        let thisref = this;

        // load a resource
        loader.load(
            // resource URL
            'textures/noise.jpg',

            // onLoad callback
            function ( texture ) {
                // in this example we create the material when the texture is loaded
                thisref.noiseTexture = texture;
                thisref.startScene();

                thisref.createPlane1();
                thisref.createPlane2();
                thisref.createPlane3();

                window.addEventListener('keydown', () => {
                    console.log("keyDown");
                }, true);

                window.addEventListener('keyup', () => {
                    console.log("keyUp");
                }, true);

                thisref.animateScene([thisref.objects]);
                thisref.renderScene();
            },

            // onProgress callback currently not supported
            undefined,

            // onError callback
            function ( err ) {
                console.error( 'An error happened.' );
            }
        );




    }


}
