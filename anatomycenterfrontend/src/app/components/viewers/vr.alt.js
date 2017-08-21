import ClassicRenderer from "./classic";
import ThreeVr from "three-vr";
import { WebGLRenderer, Camera, Scene } from "three";

export default class ThreeVRAltRenderer extends ClassicRenderer {
    setupControls = (camera: Camera, renderer: WebGLRenderer, scene: Scene): void => ThreeVr.init({
        renderer,
        scene,
        camera,
    })

    threeRenderFunction = (): void => ThreeVr.animate();
}
