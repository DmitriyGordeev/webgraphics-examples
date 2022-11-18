import * as THREE from 'three';
import {DragControls} from 'three/addons/controls/DragControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';


/**
 * This is example of how to take previous frame as a texture and use it again:
 * first fragment shader will render to texture
 * second fragment shader will use 'uniform sampler2D u_texture' to use previous state
 * and finally will draw to the viewport
 */


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
        this.renderScene();
    }


    startScene() {
        let canvas = this.canvas;
        this.renderer = new THREE.WebGLRenderer({canvas});
        this.renderer.setClearColor("#361b1b");
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
            u_texture: {type: 't', value: this.renderTarget2},
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

        let fragmentShader = `
            uniform vec2 u_screenSize;
            uniform float u_time;
            varying vec3 vPos;
            
            const float r = 0.1;
            const float rBall = 0.1;
            const vec2 centerBall = vec2(0.5);
            
            void main() {
                vec2 uv = gl_FragCoord.xy / u_screenSize;
                
                vec2 ballPos = centerBall + vec2(r * cos(u_time), r * sin(u_time));
                
                // ellipse
                float xpart = (uv.x - ballPos.x) * (uv.x - ballPos.x);
                float ypart = (uv.y - ballPos.y) * (uv.y - ballPos.y);
                
                gl_FragColor = vec4(vec3(0.0), 1.0);
                
                if (xpart + ypart <= r * r) gl_FragColor = vec4(1.0);
            }
            `;


        const shaderMaterial = new THREE.ShaderMaterial({
            uniforms: this.uniforms1,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,

            blending: THREE.AdditiveBlending,
            depthTest: false,
            transparent: true,
            vertexColors: true
        });

        const geometry = new THREE.PlaneGeometry(3, 4);

        // cubeGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
        // cubeGeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
        // cubeGeometry.setAttribute( 'size', new THREE.Float32BufferAttribute(sizes, 1 ).setUsage( THREE.DynamicDrawUsage ) );

        this.plane1 = new THREE.Mesh(geometry, shaderMaterial);
        this.plane1.rotation.y = 0.2;
        this.plane1.rotation.x = 0.3;
        this.scene1.add(this.plane1);
        this.objects.push(this.plane1);
    }


    createPlane2() {
        this.uniforms2 = {
            u_time: {type: 'f', value: 0.0},
            u_texture: {type: 't', value: this.renderTarget1},
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


        let fragmentShader = `
            uniform vec2 u_screenSize;
            uniform float u_time;
            uniform sampler2D u_texture;
            varying vec3 vPos;
            
            const float r = 0.1;
            const float rBall = 0.1;
            const vec2 centerBall = vec2(0.5);
            
            void main() {
                vec2 uv = gl_FragCoord.xy / u_screenSize;
                
                vec2 ballPos = centerBall + vec2(r * cos(u_time), r * sin(u_time));
                
                // ellipse
                float xpart = (uv.x - ballPos.x) * (uv.x - ballPos.x);
                float ypart = (uv.y - ballPos.y) * (uv.y - ballPos.y);
                
                vec4 texColor = texture(u_texture, uv);
                texColor.r = 0.8;
                gl_FragColor = vec4(vec3(0.0), 1.0) + 0.5 * texColor;
                
                if (xpart + ypart <= r * r) gl_FragColor = vec4(1.0);
            }
            `;


        const shaderMaterial = new THREE.ShaderMaterial({
            uniforms: this.uniforms2,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,

            blending: THREE.AdditiveBlending,
            depthTest: false,
            transparent: true,
            vertexColors: true
        });

        const geometry = new THREE.PlaneGeometry(3, 4);

        // cubeGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
        // cubeGeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
        // cubeGeometry.setAttribute( 'size', new THREE.Float32BufferAttribute(sizes, 1 ).setUsage( THREE.DynamicDrawUsage ) );

        this.plane2 = new THREE.Mesh(geometry, shaderMaterial);
        this.plane2.rotation.y = 0.2;
        this.plane2.rotation.x = 0.3;
        this.scene2.add(this.plane2);
        this.objects.push(this.plane2);
    }


    createPlane3() {
        this.uniforms3 = {
            u_time: {type: 'f', value: 0.0},
            u_texture: {type: 't', value: this.renderTarget2},
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


        let fragmentShader = `
            uniform vec2 u_screenSize;
            uniform float u_time;
            uniform sampler2D u_texture;
            varying vec3 vPos;
            
            const float r = 0.1;
            const float rBall = 0.1;
            const vec2 centerBall = vec2(0.5);
            
            void main() {
                vec2 uv = gl_FragCoord.xy / u_screenSize;
                gl_FragColor = texture(u_texture, uv);
            }
            `;


        const shaderMaterial = new THREE.ShaderMaterial({
            uniforms: this.uniforms2,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,

            blending: THREE.AdditiveBlending,
            depthTest: false,
            transparent: true,
            vertexColors: true
        });

        const geometry = new THREE.PlaneGeometry(3, 4);

        // cubeGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
        // cubeGeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
        // cubeGeometry.setAttribute( 'size', new THREE.Float32BufferAttribute(sizes, 1 ).setUsage( THREE.DynamicDrawUsage ) );

        this.plane3 = new THREE.Mesh(geometry, shaderMaterial);
        this.plane3.rotation.y = 0.2;
        this.plane3.rotation.x = 0.3;
        this.scene3.add(this.plane3);
        this.objects.push(this.plane3);
    }


    renderScene() {
        this.renderer.render(this.scene1, this.camera, this.renderTarget1);

        // assign the output of the first render to the second plane
        this.uniforms2.u_texture.value = this.renderTarget1.texture;


        // Now we render the second shader and assign it's texture to uniform1
        this.renderer.render(this.scene2, this.camera, this.renderTarget2);

        // assign the output of the first and third shaders
        this.uniforms1.u_texture.value = this.renderTarget2.texture;
        this.uniforms3.u_texture.value = this.renderTarget2.texture;

        // Finally render 3ed shader
        this.renderer.render(this.scene3, this.camera);
    }


    entry() {
        this.startScene();

        this.createPlane1();
        this.createPlane2();
        this.createPlane3();

        window.addEventListener('keydown', () => {
            console.log("keyDown");
        }, true);

        window.addEventListener('keyup', () => {
            console.log("keyUp");
        }, true);

        this.animateScene([this.objects]);
        this.renderScene();
    }


}
