import React, { Component, PropTypes } from "react";
import { PerspectiveCamera, Scene, MeshNormalMaterial, WebGLRenderer, Mesh, Camera } from "three";


const THREE = require("three");
const STLLoader = require("three-stl-loader")(THREE);
const OrbitalControls = require("three-orbit-controls")(THREE);

const loader = new STLLoader();
import style from "./style.sass";

export default class ClassicRenderer extends Component {
    static propTypes = {
        model: PropTypes.string,
    }

    state = {
        geometry: null,
    }
    componentWillMount() {
        loader.load(this.props.model, (geometry: any) => {
            this.setState({ geometry }, this.init);
        });

        window.addEventListener("resize", this.resizeHandler);

        if (this.onMount) {
            this.onMount();
        }
    }

    componentDidUpdate() {
        if (this.refs.root && this.state.renderer) {
            this.refs.root.appendChild(this.state.renderer.domElement);
            if (this.postRef) {
                this.postRef(this.state.renderer);
            }
        }
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.resizeHandler);
        if (this.onUnMount) {
            this.onUnMount();
        }
    }

    setupControls = (camera: Camera) => {
        const orbitalControls = new OrbitalControls(camera); // eslint-disable-line
    }

    setupCamera = (): Camera => {
        const camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
        camera.position.z = 400;
        return camera;
    }

    setupScene = (): Scene => {
        const scene = new Scene();

        const geometry = this.state.geometry;
        const material = new MeshNormalMaterial();

        const mesh = new Mesh(geometry, material);
        if (this.postScene) {
            this.postScene(mesh, geometry, material);
        }

        scene.add(mesh);
        return { scene, mesh };
    }

    setupRenderer = (): WebGLRenderer => {
        const renderer = new WebGLRenderer({
            alpha: true,
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0xffffff, 0);
        return renderer;
    }

    init() {
        if (this.preSetup) {
            this.preSetup();
        }

        const { scene, mesh } = this.setupScene();
        const camera = this.setupCamera();
        const renderer = this.setupRenderer();

        if (camera instanceof Camera || camera instanceof PerspectiveCamera) {
            scene.add(camera);
        }

        if (this.postSetup) {
            this.postSetup(renderer, scene, camera, mesh);
        }
        this.setupControls(camera, renderer, scene);

        this.setState({ renderer, scene, camera, mesh });
        setTimeout(this.animate, 500);
    }

    resizeHandler = () => {
        const { renderer, camera } = this.state;
        if (renderer) {
            if (camera instanceof PerspectiveCamera) {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
            }
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
        if (this.resizeExtra) {
            this.resizeExtra(renderer, camera);
        }
    }

    animate = () => {
        requestAnimationFrame(this.animate);
        const { renderer, scene, camera } = this.state;
        if (renderer) {
            this.threeRenderFunction(renderer, scene, camera);
        }
    }

    threeRenderFunction = (renderer: WebGLRenderer, scene: Scene, camera: Camera) => {
        renderer.render(scene, camera);
    }

    render(): Component {
        return <div ref="root" className={style.root}></div>;
    }
}
