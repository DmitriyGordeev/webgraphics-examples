import * as THREE from 'three';
import {DragControls} from 'three/addons/controls/DragControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';



export class ThreeShadersExample {
    constructor() {
        this.setupFrameCallback();
        this.canvas = document.getElementById('c');
        this.scale();

        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.clock = new THREE.Clock();

        this.objects = [];
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

        this.uniforms.u_time.value = this.clock.getElapsedTime();
        this.renderScene();
    }


    startScene() {
        let canvas = this.canvas;
        this.renderer = new THREE.WebGLRenderer({canvas});
        this.renderer.setClearColor("#361b1b");
        this.renderer.setSize(this.cw, this.ch);

        this.scene = new THREE.Scene();
        let aspect = this.canvas.width / this.canvas.height;

        this.camera = new THREE.PerspectiveCamera(45, aspect);
        this.camera.position.set(0, 0, 10);
        this.camera.lookAt(0, 0, 0);
        this.scene.add(this.camera);
    }


    createCube() {

        this.uniforms = {
            u_time: { type: 'f', value: 0.0 }
        };

        let vertexShader = `
            uniform float u_time;
        
            varying vec3 vColor;
            attribute float size;
            
            void main() {
                vColor = vec3(position.x + sin(u_time), position.y - cos(u_time), position.z);
                
                vec3 newPos = position;
                newPos.x = newPos.x * (1.0 + 0.2 * sin(4.0 * u_time));
                newPos.y = newPos.y * (1.0 + 0.2 * cos(3.0 * u_time));
                newPos.z = newPos.z * (1.0 + 0.2 * sin(4.0 * u_time));
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4( newPos, 1.0 );
            }
            `;

        let fragmentShader = `
            varying vec3 vColor;
            void main() {
                gl_FragColor = vec4( vColor, 1.0 );
            }
            `;


        const shaderMaterial = new THREE.ShaderMaterial( {
            uniforms: this.uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,

            blending: THREE.AdditiveBlending,
            depthTest: false,
            transparent: true,
            vertexColors: true
        } );


        let cubeGeometry = new THREE.BoxGeometry(2, 2, 2);

        let sizes = Array.apply(0, new Array(36)).map(i => 1.0)

        console.log(sizes);

        // cubeGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
        // cubeGeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
        cubeGeometry.setAttribute( 'size', new THREE.Float32BufferAttribute(sizes, 1 ).setUsage( THREE.DynamicDrawUsage ) );

        this.cube = new THREE.Mesh(cubeGeometry, shaderMaterial);
        this.cube.rotation.y = 0.2;
        this.cube.rotation.x = 0.3;
        this.scene.add(this.cube);
    }


    createPlane() {
        this.uniforms = {
            u_time: { type: 'f', value: 0.0 },
            u_screenSize: {type: 'v2', value: new THREE.Vector2(window.innerWidth, window.innerHeight)}
        };

        console.log(window.innerWidth + "," + window.innerHeight);

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


        const shaderMaterial = new THREE.ShaderMaterial( {
            uniforms: this.uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,

            blending: THREE.AdditiveBlending,
            depthTest: false,
            transparent: true,
            vertexColors: true
        } );

        const geometry = new THREE.PlaneGeometry( 3, 4 );

        // cubeGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
        // cubeGeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
        // cubeGeometry.setAttribute( 'size', new THREE.Float32BufferAttribute(sizes, 1 ).setUsage( THREE.DynamicDrawUsage ) );

        let plane = new THREE.Mesh(geometry, shaderMaterial);
        plane.rotation.y = 0.2;
        plane.rotation.x = 0.3;
        this.scene.add(plane);
        this.objects.push(plane);
    }


    renderScene() {
        this.renderer.render(this.scene, this.camera);
    }


    entry() {
        this.startScene();

        this.createPlane();

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
