import { SceneManager } from "./scene/SceneManager.ts";
import { SceneInteractor } from "./scene/SceneInteractor.ts";
import { ZoneName } from "./config.ts";

export const cameraHistory: { zone: ZoneName; action?: () => void }[] = [];
export let currentIndex = -1;

const zoneMeshMain = [ZoneName.STANDS, ZoneName.POOL, ZoneName.LOCKER_ROOM, ZoneName.START];

export function setCurrentIndex(index: number) {
  currentIndex = index;
}
export function addCameraMove(
  sceneManager: SceneManager,
  zone: ZoneName,
  action?: () => void,
  interactor?: SceneInteractor // permet de faire cleanup
) {
  // Vérifier si la zone existe déjà dans l'historiquea
  const existingIndex = cameraHistory.findIndex(item => item.zone === zone);

  console.log("Camera history zones:", cameraHistory.map(item => item.zone));
    console.log("Nouvelle zone:", zone);

  if (existingIndex !== -1 && zoneMeshMain.includes(zone)) {
    console.log("IL EXISTE DEJA L INSTANCE DONC JE DOIS DISPOSE");
    // Appeler le cleanup via la méthode publique du SceneInteractor
    interactor?.disposeCurrInteraction();

    // Supprimer l'ancienne entrée
    cameraHistory.splice(existingIndex, 1);

    // Ajuster currentIndex si nécessaire
    if (existingIndex <= currentIndex) currentIndex--;
  }

  // Couper le futur si on est au milieu de l’historique
  cameraHistory.splice(currentIndex + 1);

  // Ajouter le nouveau mouvement
  cameraHistory.push({ zone, action });
  currentIndex++;

  // Déplacer la caméra et exécuter l’action
  sceneManager.moveCameraTo(zone, () => {
    action?.();
  });

  // Ajouter un état dans l'historique navigateur
  window.history.pushState({ cameraState: zone }, "");
}

// --- BACK/FORWARD ---
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