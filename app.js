import * as THREE from '../../libs/three/three.module.js';
import { OrbitControls } from '../../libs/three/jsm/OrbitControls.js';
import { GLTFLoader } from '../../libs/three/jsm/GLTFLoader.js';
import { FBXLoader } from '../../libs/three/jsm/FBXLoader.js';
import { RGBELoader } from '../../libs/three/jsm/RGBELoader.js';
import { LoadingBar } from '../../libs/LoadingBar.js';
import { vector3ToString } from '../../libs/DebugUtils.js';

import { VRButton } from '../../libs/three/jsm/VRButton.js';
import { XRControllerModelFactory } from '../../libs/three/jsm/XRControllerModelFactory.js';
import { BoxLineGeometry } from '../../libs/three/jsm/BoxLineGeometry.js';
import { Stats } from '../../libs/stats.module.js';

class App{
	constructor(){
		const container = document.createElement( 'div' );
        document.body.appendChild( container );

        this.clock = new THREE.Clock();
        
        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 100);
        this.camera.position.set(0,1.6,3);

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x505050);

        const ambient = new THREE.HemisphereLight(0x606060, 0x404040);
        this.scene.add(ambient);

        const light = new THREE.DirectionalLight(0xffffff);
        light.position.set(1,1,1).normalize();
        this.scene.add(light);

        this.renderer = new THREE.WebGLRenderer( {antialias: true, alpha: true} );
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        container.appendChild(this.renderer.domElement);

        this.renderer.setAnimationLoop(this.render.bind(this));

        //Start of Basic Geometry
        //const geometry = new THREE.TorusKnotBufferGeometry(0.8, 0.3, 120, 16)
        //const geometry = new THREE.BoxBufferGeometry();
        //End of Basic Geometry

        // Start of Star Geometry
        /*const shape = new THREE.Shape();
        const outerRadius = 0.8;
        const innerRadius = 0.4;
        const PI2 = Math.PI * 2;
        const inc = PI2 / 10;

        shape.moveTo(outerRadius, 0);
        let inner = true;

        for(let theta = inc; theta < PI2; theta+=inc){
            const radius = (inner) ? innerRadius : outerRadius;
            shape.lineTo(Math.cos(theta) * radius, Math.sin(theta) * radius);
            inner = !inner;
        }

        const extrudeSettings = {
            steps: 1,
            depth: 1,
            bevelEnabled: false
        };

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);*/
        //End of Star Geometry

        //Creating Loading Bar and loading in FBX object
        //this.loadingBar = new LoadingBar();
        //this.loadFBX();

        const material = new THREE.MeshStandardMaterial({color: 0xff0000, specular: 0x444444, shininess: 60});

        //this.mesh = new THREE.Mesh(geometry, material);

        //this.scene.add(this.mesh)

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.target.set(0, 1.6, 0);
        this.controls.update();

        this.stats = new Stats();
        container.appendChild( this.stats.dom );

        this.initScene();
        this.setupXR();

        window.addEventListener('resize', this.resize.bind(this) );
    }	
    

    random( min, max ){
        return Math.random() * (max-min) + min;
    }

    initScene(){
        this.radius = 0.08;
        this.room = new THREE.LineSegments(
            new BoxLineGeometry(6,6,6,10,10,10),
            new THREE.LineBasicMaterial({color: 0x808080})
        );
        this.room.geometry.translate = (0,3,0);
        this.scene.add(this.room);

        const geometry = new THREE.IcosahedronBufferGeometry(this.radius, 2);
        for(let i = 0; i < 200; i++){
            const object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
                color: Math.random() * 0xFFFFFF
            }));

            object.position.x = this.random(-2,2);
            object.position.y = this.random(-2,2);
            object.position.z = this.random(-2,2);

            this.room.add(object);
        }
    }
    
    setupXR(){
        this.renderer.xr.enabled = true;
        document.body.appendChild(VRButton.createButton(this.renderer));
    }
    

    loadGLTF(){
        const self = this;
        const loader = new GLTFLoader().setPath('./assets/');

        loader.load(
            'office-chair.glb',
            function(gltf){
                self.chair = gltf.scene;
                const bBox = new THREE.Box3().setFromObject(gltf.scene);
                console.log(`min:${vector3ToString(bBox.min, 2)} - 
                max:${vector3ToString(bBox.max, 2)}`);
                self.scene.add(gltf.scene);
                self.loadingBar.visible = false;
                self.renderer.setAnimationLoop(self.render.bind(self));
            },
            function(xhr){
                self.loadingBar.progress = xhr.loaded/xhr.total;
            },
            function(err){
                console.log("An error happened");
            }
        )
    }
    
    loadFBX(){

        const self = this;
        const loader = new FBXLoader().setPath('./assets/');

        loader.load(
            'office-chair.fbx',
            function(object){
                self.chair = object;
                const bBox = new THREE.Box3().setFromObject(object);
                console.log(`min:${vector3ToString(bBox.min, 2)} - 
                max:${vector3ToString(bBox.max, 2)}`);
                self.scene.add(object);
                self.loadingBar.visible = false;
                self.renderer.setAnimationLoop(self.render.bind(self));
            },
            function(xhr){
                self.loadingBar.progress = xhr.loaded/xhr.total;
            },
            function(err){
                console.log("An error happened");
            }
        )
    }

    resize(){
        this.camera.aspect = window.innerWidth/window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
	render( ) {   
        //this.mesh.rotateY(0.01)
        this.stats.update();
        this.renderer.render(this.scene, this.camera);
    }
}

export { App };