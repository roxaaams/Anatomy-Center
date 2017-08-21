import ClassicRenderer from "./classic";

import { WebGLRenderer, Scene, Camera } from "three";
// import { ArToolkitSource, ArToolkitContext, ArMarkerControls } from "ar.js/build/ar.js";

global.THREEx = global.THREEx || {};
global.THREE = global.THREE || require("three"); // eslint-disable-line

let videoBackup = null;

export default class ARRenderer extends ClassicRenderer {

    setupCamera = (): Camera => new Camera();
    resizeExtra = (renderer: WebGLRenderer) => {
        if (this.arToolkitSource && renderer) {
            this.arToolkitSource.onResizeElement();
            this.arToolkitSource.copyElementSizeTo(renderer.domElement);
            if (this.arToolkitContext.arController !== null) {
                this.arToolkitSource.copyElementSizeTo(this.arToolkitContext.arController.canvas);
            }
        }
    }

    postScene(mesh: Object, geometry: Object) {
        geometry.computeBoundingBox();
        const sizes = [
            0 - geometry.boundingBox.min.x + geometry.boundingBox.max.x,
            0 - geometry.boundingBox.min.y + geometry.boundingBox.max.y,
            0 - geometry.boundingBox.min.z + geometry.boundingBox.max.z,
        ];
        const offset = 1 / sizes.reduce((prev: number, it: number): number => (it > prev ? it : prev), 0);
        mesh.scale.set(offset, offset, offset);
        mesh.position.y = 1; // eslint-disable-line
    }

    postSetup(renderer: WebGLRenderer, scene: Scene, camera: Camera) {
        const e = document.querySelector("#ar") || document.createElement("script");
        e.src = "https://rawgit.com/jeromeetienne/AR.js/master/three.js/build/ar.js";
        e.id = "ar";
        e.onload = () => {
            const { ArToolkitSource, ArToolkitContext, ArMarkerControls } = global.THREEx;
            this.arToolkitSource = new ArToolkitSource({
                sourceType: "webcam",
            });

            this.arToolkitSource.init(() => {
                this.resizeExtra(renderer);
            });

            this.arToolkitContext = new ArToolkitContext({
                // debug: true,
                cameraParametersUrl: "https://rawgit.com/jeromeetienne/AR.js/master/data/data/camera_para.dat",
                detectionMode: "mono",
            });

            this.arToolkitContext.init(() => {
                camera.projectionMatrix.copy(this.arToolkitContext.getProjectionMatrix());
            });

            this.markerControls = new ArMarkerControls(this.arToolkitContext, camera, {
                type: "pattern",
                patternUrl: "https://rawgit.com/jeromeetienne/AR.js/master/data/data/patt.hiro",
                changeMatrixMode: "cameraTransformMatrix",
            });
        };
        document.head.appendChild(e);

        scene.visible = false; // eslint-disable-line
    }

    threeRenderFunction = (renderer: WebGLRenderer, scene: Scene, camera: Camera) => {
        if (this.arToolkitSource && this.arToolkitSource.ready !== false)	{
            this.arToolkitContext.update(this.arToolkitSource.domElement);
            scene.visible = camera.visible; // eslint-disable-line
        }
        renderer.render(scene, camera);
    }

    postRef = (renderer: WebGLRenderer) => {
        document.body.appendChild(renderer.domElement);
        if (this.props.clickHandler) {
            renderer.domElement.addEventListener("click", this.props.clickHandler);
        }
        renderer.domElement.id = "main-scene"; // eslint-disable-line
    }

    onMount = (): void => videoBackup && document.body.appendChild(videoBackup);

    onUnMount = () => {
        document.body.removeChild(this.state.renderer.domElement);
        videoBackup = document.body.querySelector("body > video");
        document.body.removeChild(videoBackup);
    }
}
