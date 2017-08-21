import ClassicRenderer from "./classic";
import { Camera, Scene, PerspectiveCamera, WebGLRenderer } from "three";
// import DeviceOrientationControls from "three-device-orientation";

export default class ThreeVRRenderer extends ClassicRenderer {
    views = [{
        left: 0,
        top: 0,
        width: 0.5,
        height: 1,
        eye: [-50, 0, 500],
        fov: 30,
        updateCamera: (camera: Camera, scene: Scene) => {
            camera.lookAt(scene.position);
        },
    }, {
        left: 0.5,
        top: 0,
        width: 0.5,
        height: 1,
        eye: [50, 0, 500],
        fov: 30,
        updateCamera: (camera: Camera, scene: Scene) => {
            camera.lookAt(scene.position);
        },
    }];

    setupCamera = (): Camera =>
        this.views.map((view: Object): Object => {
            const camera = new PerspectiveCamera(view.fov, window.innerWidth, window.innerHeight, 1, 1000);
            camera.position.fromArray(view.eye);
            view.camera = camera; // eslint-disable-line
            return view;
        });

    setupControls = () => {
        window.addEventListener("deviceorientation", this.orientationControls);
    // const orientationControls = new DeviceOrientationControls(mesh, true); // eslint-disable-line
    }

    orientationControls = (e: Event): void => this.state.mesh && (this.state.mesh.rotation.y = e.alpha ? e.alpha / 90 : 0)

    postRef = (renderer: WebGLRenderer) => {
        document.body.appendChild(renderer.domElement);
        if (this.props.clickHandler) {
            renderer.domElement.addEventListener("click", this.props.clickHandler);
        }
        renderer.domElement.id = "main-scene"; // eslint-disable-line
    }

    onUnMount = () => {
        window.removeEventListener("deviceorientation", this.orientationControls);
        document.body.removeChild(this.state.renderer.domElement);
    }

    threeRenderFunction = (renderer: WebGLRenderer, scene: Scene, cameras: Object[]) => {
        cameras.forEach((view: Object) => {
            const camera = view.camera;
            view.updateCamera(camera, scene);

            const left = Math.floor(window.innerWidth * view.left);
            const top = Math.floor(window.innerHeight * view.top);
            const width = Math.floor(window.innerWidth * view.width);
            const height = Math.floor(window.innerHeight * view.height);

            renderer.setViewport(left, top, width, height);
            renderer.setScissor(left, top, width, height);
            renderer.setScissorTest(true);
            renderer.setClearColor(0xffffff);

            camera.aspect = width / height;
            camera.updateProjectionMatrix();

            renderer.render(scene, camera);
        });
    }
}
