import * as THREE from 'three';
import {DragControls} from 'three/addons/controls/DragControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


// 1. слушаем mouse drag event
// 2. если происходит, рассчитываем drag distance (на экране в px)
// 3. меням this.angle


const px2angleCoeff = 2 * Math.PI / 10000;   // 10000px -> 2PI

let mouseDown = false;
let mouseX = 0;
let mouseY = 0;
let mouseXDistance = 0;
let mouseLastDistance = 0;
let mouseXSpeed = 0;


export class ThreeExample {
    constructor() {
        this.setupFrameCallback();
        this.canvas = document.getElementById('c');
        this.scale();

        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();

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
            mouseXDistance = 0;
            mouseXSpeed = 0;
            mouseLastDistance = 0;
        });

        window.addEventListener('mousemove', (e) => {
            if (mouseDown) {
                mouseXDistance = e.screenX - mouseX;
                mouseXSpeed = mouseXDistance - mouseLastDistance;
                mouseLastDistance = mouseXDistance;
                console.log("mouseXSpeed = " + mouseXSpeed);
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
    }


    animateScene(objects) {
        window.customRequestAnimationFrame(() => {
            this.animateScene(objects)
        });

        // // simple animation:
        // for (let i = 0; i < objects.length; i++) {
        //     objects[i].rotation.y += 0.02;
        //     objects[i].rotation.x += 0.01;
        // }

        objects[0].rotation.y += mouseXSpeed / 100;
        objects[0].position.y += mouseXSpeed / 1000;

        this.renderScene();
    }


    startScene(cube) {
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

        // const light = new THREE.AmbientLight(new THREE.Color(1.0, 1.0, 1.0), 0.5); // soft white light
        // this.scene.add( light );

        // const light = new THREE.PointLight( 0xffffff, 2, 20 );
        // light.position.set( 0, 10, 0 );
        // this.scene.add( light );

        cube.position.set(0, 0, -7.0);
        this.scene.add(cube);
    }


    createCube() {
        let cubeMaterials = [
            new THREE.MeshBasicMaterial({color: 0x2173fd}),
            new THREE.MeshBasicMaterial({color: 0xd5d918}),
            new THREE.MeshBasicMaterial({color: 0xd2dbeb}),
            new THREE.MeshBasicMaterial({color: 0xa3a3c6}),
            new THREE.MeshBasicMaterial({color: 0xfe6b9f}),
            new THREE.MeshBasicMaterial({color: 0x856af9})
        ];

        let cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
        this.cube = new THREE.Mesh(cubeGeometry, cubeMaterials);
    }


    createCustomGeometry() {
        const geometry = new THREE.BufferGeometry();
        // create a simple square shape. We duplicate the top left and bottom right
        // vertices because each vertex needs to appear once per triangle.

        const y = 0.866025404;
        const y2 = 0.5;
        const h = 1;

        const vertices = new Float32Array([
            -y2, 0, 0,
            y2, 0, 0,
            0, 0, y,

            -y2, h, 0,
            y2, h, 0,
            0, h, y,
        ]);

        const indices = [
            0, 1, 2, // Top
            5, 4, 3, // Bottom
            3, 1, 0, // Back
            1, 3, 4, // Back
            0, 2, 3, // Left
            5, 3, 2, // Left
            4, 2, 1, // Right
            2, 4, 5, // Right
        ];


        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();

        geometry.clearGroups();
        geometry.addGroup(0, 3, 0);
        geometry.addGroup(3, 6, 1);
        geometry.addGroup(6, 12, 2);
        geometry.addGroup(12, 18, 3);
        geometry.addGroup(18, 24, 4);

        let material = [
            new THREE.MeshBasicMaterial({
                color: 0x00ff00
            }),
            new THREE.MeshBasicMaterial({
                color: 0xff0000
            }),
            new THREE.MeshBasicMaterial({
                color: 0x0000ff,
            }),
            new THREE.MeshBasicMaterial({
                color: 0xff0000
            }),
            new THREE.MeshBasicMaterial({
                color: 0x0000ff
            })
        ];


        // itemSize = 3 because there are 3 values (components) per vertex
        geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
        // const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
        this.customMesh = new THREE.Mesh( geometry, material );
    }


    renderScene() {
        this.renderer.render(this.scene, this.camera);
    }


    draw() {
        this.createCube();
        this.createCustomGeometry();
        this.startScene(this.cube);
        // this.scene.add(this.customMesh);
        this.loadCustomModel();

        this.controls = new DragControls([this.customMesh], this.camera, this.renderer.domElement);
        this.controls.addEventListener('drag', () => {
            this.renderScene();
        });

        let thisref = this;
        document.addEventListener('click', () => {
            const draggableObjects = thisref.controls.getObjects();
            console.log("draggableObjects = " + draggableObjects);

            thisref.raycaster.setFromCamera( thisref.mouse, thisref.camera );
            const intersections = thisref.raycaster.intersectObjects([thisref.customMesh], true);
            console.dir("intersections = " + intersections);
            if (intersections.length > 0) {
                console.dir(intersections[0]);
            }

        });

        window.addEventListener('keydown', () => {
            console.log("keyDown");
        }, true);

        window.addEventListener('keyup', () => {
            console.log("keyUp");
        }, true);


        // this.animateScene([this.cube]);
        // this.renderScene();
    }


    /* This function loads custom model from .gltf file */
    loadCustomModel() {
        let thisref = this;

        const loader = new GLTFLoader().setPath( 'models/' );

        loader.load( 'cylinder.gltf', function ( gltf ) {
            let customModel = gltf.scene;
            // thisref.scene.add(customModel);
            thisref.renderScene();
            // thisref.animateScene([thisref.cube, customModel]);
            thisref.animateScene([thisref.cube]);
        } );
    }






}
