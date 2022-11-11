import * as THREE from 'three';
import {DragControls} from 'three/addons/controls/DragControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


export class ThreeExample {
    constructor() {
        this.setupFrameCallback();
        this.canvas = document.getElementById('c');
        this.scale();

        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
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

        console.log(objects);

        objects[0].rotation.y += 0.02;
        objects[0].rotation.x += 0.01;

        objects[1].rotation.y -= 0.02;
        objects[1].rotation.x -= 0.01;

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


    renderScene() {
        this.renderer.render(this.scene, this.camera);
    }

    draw() {
        this.createCube();
        this.startScene(this.cube);

        this.loadCustomModel();

        this.controls = new DragControls([this.cube], this.camera, this.renderer.domElement);
        this.controls.addEventListener('drag', () => {this.renderScene()});

        let thisref = this;
        document.addEventListener('click', () => {
            const draggableObjects = thisref.controls.getObjects();
            console.log("draggableObjects = " + draggableObjects);

            thisref.raycaster.setFromCamera( thisref.mouse, thisref.camera );
            const intersections = thisref.raycaster.intersectObjects([thisref.cube], true);
            console.log("intersections = " + intersections);
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


    loadCustomModel() {
        let thisref = this;
        const loader = new GLTFLoader().setPath( 'models/' );

        loader.load( 'cube_bevel.gltf', function ( gltf ) {
            console.log("gltf" + gltf);
            let bevelCube = gltf.scene;
            thisref.scene.add(bevelCube);

            thisref.renderScene();
            thisref.animateScene([thisref.cube, bevelCube]);
        } );
    }




}
