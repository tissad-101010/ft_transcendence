import { SceneManager } from "./scene/SceneManager";
import { SceneInteractor } from "./scene/SceneInteractor";
import { ZoneName } from "./config";

export interface CameraHistoryEntry {
  zone: ZoneName;
  actionOnClick?: () => void;       // ce qui se passe sur un clic normal
  actionOnPopState?: () => void;    // ce qui se passe sur back/forward
}

export const cameraHistory: CameraHistoryEntry[] = [];
export let currentIndex = -1;
export const mainZones: ZoneName[] = [
  ZoneName.STANDS,
  ZoneName.POOL,
  ZoneName.LOCKER_ROOM,
  ZoneName.START,
];

/**
 * Ajoute un mouvement de caméra au clic normal
 */
export function addCameraMove(
  manager: SceneManager,
  zone: ZoneName,
  actionOnClick?: () => void,
  actionOnPopState?: () => void
) {
  const interactor = manager.getSceneInteractor;
  if (!interactor) return;

  // Supprime l'ancienne instance si c'est une mainZone
  if (mainZones.includes(zone)) interactor.disposeCurrInteraction();

  // Supprime le doublon dans l'historique
  const existingIndex = cameraHistory.findIndex(e => e.zone === zone);
  if (existingIndex !== -1 && mainZones.includes(zone)) {
    cameraHistory.splice(existingIndex, 1);
    if (existingIndex <= currentIndex) currentIndex--;
  }

  // Supprime le futur si on navigue au milieu de l’historique
  cameraHistory.splice(currentIndex + 1);

  // Ajoute le mouvement dans l’historique
  cameraHistory.push({ zone, actionOnClick, actionOnPopState });
  currentIndex++;

  // Déplace la caméra
  manager.moveCameraTo(zone, () => actionOnClick?.());

  // Ajoute un état dans le navigateur
  window.history.pushState({ cameraState: zone }, "");
}

/**
 * Clic navigateur back
 */
export function back(manager: SceneManager) {
    if (currentIndex <= 0) return;
    currentIndex--;
    const entry = cameraHistory[currentIndex];
    const interactor = manager.getSceneInteractor;
    if (!interactor) return;

    if (mainZones.includes(entry.zone)) interactor.disposeCurrInteraction();
    manager.moveCameraTo(entry.zone);
    interactor.recreateZone(entry.zone);

    if (typeof entry.actionOnPopState === "function") {
        entry.actionOnPopState();
    }
}

export function forward(manager: SceneManager) {
    if (currentIndex >= cameraHistory.length - 1) return;
    currentIndex++;
    const entry = cameraHistory[currentIndex];
    const interactor = manager.getSceneInteractor;
    if (!interactor) return;

    if (mainZones.includes(entry.zone)) interactor.disposeCurrInteraction();
    manager.moveCameraTo(entry.zone);
    interactor.recreateZone(entry.zone);

    if (typeof entry.actionOnPopState === "function") {
        entry.actionOnPopState();
    }
}


