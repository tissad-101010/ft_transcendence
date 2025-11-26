import { SceneManager } from "./scene/SceneManager.ts";
import { ZoneName } from "./config.ts";

export const cameraHistory: { zone: ZoneName; action?: () => void }[] = [];
export let currentIndex = -1;

export function addCameraMove(sceneManager: SceneManager, zone: ZoneName, action?: () => void) {
    cameraHistory.splice(currentIndex + 1); // coupe le futur
    cameraHistory.push({ zone, action });
    currentIndex++;


      console.log("=== Camera History ===");
    console.log("Index actuel :", currentIndex);
    console.log(cameraHistory.map((item, i) => ({ i, zone: item.zone })));

    sceneManager.moveCameraTo(zone, () => {
        action?.();
    });

    window.history.pushState({ cameraState: zone }, "");
}

export function back(sceneManager: SceneManager) {
    if (currentIndex > 0) {
        currentIndex--;
        const move = cameraHistory[currentIndex];
        sceneManager.moveCameraTo(move.zone, () => move.action?.());
    }
}

export function forward(sceneManager: SceneManager) {
    if (currentIndex < cameraHistory.length - 1) {
        currentIndex++;
        const move = cameraHistory[currentIndex];
        sceneManager.moveCameraTo(move.zone, () => move.action?.());
    }
}

export function setCurrentIndex(index: number) {
    currentIndex = index;
}