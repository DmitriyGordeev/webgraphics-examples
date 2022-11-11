import * as THREE from 'three';


export class ThreeExample {
    constructor() {
        this.setupFrameCallback();
        this.ctx = null;
        this.canvas = document.getElementById('c');
        this.scale();
    }

    setupFrameCallback() {
        window.myRequestAnimFrameCall = function () {
            return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (a) {
                window.setTimeout(a, 1E3 / 60)
            }
        }();
    }

    scale() {
        this.dpr = window.devicePixelRatio;
        this.cw = window.innerWidth;
        this.ch = window.innerHeight;
        this.canvas.width = this.cw * this.dpr;
        this.canvas.height = this.ch * this.dpr;
    }



    animateScene(cube) {
        // requestAnimationFrame(this.animateScene);

        window.myRequestAnimFrameCall(() => {this.animateScene(cube)});

        cube.rotation.y += 0.02;
        cube.rotation.x += 0.01;
        this.renderScene();
    }


    startScene(cube) {
        let canvas = this.canvas;
        this.render = new THREE.WebGLRenderer({canvas});
        this.render.setClearColor("#3a3535");
        this.render.setSize(this.cw, this.ch);

        // this.canvas.appendChild(this.render.domElement);
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
            new THREE.MeshBasicMaterial({color:0x2173fd}),
            new THREE.MeshBasicMaterial({color:0xd5d918}),
            new THREE.MeshBasicMaterial({color:0xd2dbeb}),
            new THREE.MeshBasicMaterial({color:0xa3a3c6}),
            new THREE.MeshBasicMaterial({color:0xfe6b9f}),
            new THREE.MeshBasicMaterial({color:0x856af9})
        ];

        // let cubeMaterial = new THREE.MeshFaceMaterial(cubeMaterials);
        let cubeGeometry = new THREE.BoxGeometry(2, 2, 2);

        let cube = new THREE.Mesh(cubeGeometry, cubeMaterials);
        return cube;
    }


    renderScene() {
        this.render.render(this.scene, this.camera);
    }

    draw() {
        let cube = this.createCube();
        this.startScene(cube);
        this.animateScene(cube);
        this.renderScene();
    }

}
