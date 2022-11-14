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
        this.renderer.setClearColor("#3a3535");
        this.renderer.setSize(this.cw, this.ch);

        this.scene = new THREE.Scene();
        let aspect = this.canvas.width / this.canvas.height;

        this.camera = new THREE.PerspectiveCamera(45, aspect);
        this.camera.position.set(0, 0, 10);
        this.camera.lookAt(0, 0, 0);
        this.scene.add(this.camera);

        // const ambientLight = new THREE.AmbientLight(new THREE.Color(1.0, 1.0, 1.0), 0.5); // soft white light
        // this.scene.add( ambientLight );
        //
        // const pointLight = new THREE.PointLight( 0xffffff, 2, 20 );
        // pointLight.position.set( 0, 10, 0 );
        // this.scene.add( pointLight );
    }



    createPoints() {
        this.uniforms = {
            pointTexture: { value: new THREE.TextureLoader().load( 'textures/spark1.png' ) },
            u_time: {type: 'f', value: 0.0}
        };

        let vertexShader = `
            uniform float u_time;
            attribute float size;
            varying vec3 vColor;
            void main() {
                vColor = color;
                vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
                mvPosition.x = sin(mvPosition.x * u_time);
                gl_PointSize = size * ( 300.0 / -mvPosition.z );
                gl_Position = projectionMatrix * mvPosition;
            }`;

        let fragmentShader = `
            uniform sampler2D pointTexture;
            varying vec3 vColor;
            void main() {
                gl_FragColor = vec4( vColor, 1.0 );
                gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );
                // gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_FragCoord );
            }`;

        const shaderMaterial = new THREE.ShaderMaterial( {
            uniforms: this.uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,

            blending: THREE.AdditiveBlending,
            depthTest: false,
            transparent: true,
            vertexColors: true
        } );

        const radius = 200;
        let geometry = new THREE.BufferGeometry();

        const positions = [];
        const colors = [];
        const sizes = [];

        const color = new THREE.Color();

        let particles = 10000;
        for ( let i = 0; i < particles; i ++ ) {
            positions.push( ( Math.random() * 2 - 1 ) * radius );
            positions.push( ( Math.random() * 2 - 1 ) * radius );
            positions.push( ( Math.random() * 2 - 1 ) * radius );

            color.setHSL( i / particles, 1.0, 0.5 );
            colors.push( color.r, color.g, color.b );
            sizes.push( 20 );
        }

        geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
        geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
        geometry.setAttribute( 'size', new THREE.Float32BufferAttribute( sizes, 1 ).setUsage( THREE.DynamicDrawUsage ) );

        this.particleSystem = new THREE.Points( geometry, shaderMaterial );
        console.log(this.scene);
        this.geometry = geometry;
        this.scene.add( this.particleSystem );
    }


    renderScene() {

        const time = Date.now() * 0.005;
        this.particleSystem.rotation.z = 0.01 * time;
        const sizes = this.geometry.attributes.size.array;
        for ( let i = 0; i < 10000; i ++ ) {
            sizes[ i ] = 3 * ( 1 + Math.sin( 0.1 * i + time ) );
        }
        this.geometry.attributes.size.needsUpdate = true;

        this.renderer.render(this.scene, this.camera);
    }


    draw() {
        this.startScene();
        this.createPoints();

        // this.controls = new DragControls([this.customMesh], this.camera, this.renderer.domElement);
        // this.controls.addEventListener('drag', () => {
        //     this.renderScene();
        // });

        // let thisref = this;
        // document.addEventListener('click', () => {
        //     const draggableObjects = thisref.controls.getObjects();
        //     console.log("draggableObjects = " + draggableObjects);
        //
        //     thisref.raycaster.setFromCamera( thisref.mouse, thisref.camera );
        //     const intersections = thisref.raycaster.intersectObjects([thisref.customMesh], true);
        //     console.dir("intersections = " + intersections);
        //     if (intersections.length > 0) {
        //         console.dir(intersections[0]);
        //     }
        // });

        window.addEventListener('keydown', () => {
            console.log("keyDown");
        }, true);

        window.addEventListener('keyup', () => {
            console.log("keyUp");
        }, true);

        this.animateScene([this.particleSystem]);
        this.renderScene();
    }


}