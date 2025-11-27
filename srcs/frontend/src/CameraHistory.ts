import { SceneManager } from "./scene/SceneManager";
import { SceneInteractor } from "./scene/SceneInteractor";
import { ZoneName } from "./config";

export interface CameraHistoryEntry {
  zone: ZoneName;
  callback: () => void; // ce qui se passe quand on arrive sur la zone
}

export const cameraHistory: CameraHistoryEntry[] = [];
export let currentIndex = -1;

// Liste des zones autorisées dans l'historique
const mainZones: ZoneName[] = [
  ZoneName.STANDS,
  ZoneName.LOCKER_ROOM,
  ZoneName.START,
];

/**
 * Déplace la caméra sur une zone principale et enregistre le mouvement
 */
export function addCameraMove(
  manager: SceneManager,
  zone: ZoneName,
  callback: () => void
) {
  if (!mainZones.includes(zone)) {
    console.log(`🚫 Zone ignorée, non autorisée pour l'historique : ${zone}`);
    return;
  }

  const interactor = manager.getSceneInteractor;
  if (!interactor) return;

  interactor.disposeCurrInteraction();

  const existingIndex = cameraHistory.findIndex(e => e.zone === zone);
  if (existingIndex !== -1) {
    cameraHistory.splice(existingIndex, 1);
    if (existingIndex <= currentIndex) currentIndex--;
  }

  cameraHistory.splice(currentIndex + 1);
  cameraHistory.push({ zone, callback });
  currentIndex++;

  manager.moveCameraTo(zone);
  callback();
  window.history.pushState({ cameraState: zone }, "");

  console.log("📷 Historique caméras :", cameraHistory.map(e => e.zone));
}

/**
 * BACK navigateur
 */
export function back(manager: SceneManager) {
  if (currentIndex <= 0) {
    alert("⛔ Vous êtes déjà au début de l'historique !");
    return;
  }

  const entry = cameraHistory[currentIndex - 1];

  if (!mainZones.includes(entry.zone)) {
    alert("🚫 Impossible de naviguer vers une zone secondaire !");
    return;
  }

  currentIndex--;
  const interactor = manager.getSceneInteractor;
  if (!interactor) return;

  interactor.disposeCurrInteraction();
  manager.moveCameraTo(entry.zone);
  entry.callback();

  console.log("⬅️ BACK vers zone :", entry.zone);
}

/**
 * FORWARD navigateur
 */
export function forward(manager: SceneManager) {
  if (currentIndex >= cameraHistory.length - 1) {
    alert("⛔ Vous êtes déjà à la fin de l'historique !");
    return;
  }

  const entry = cameraHistory[currentIndex + 1];

  if (!mainZones.includes(entry.zone)) {
    alert("🚫 Impossible de naviguer vers une zone secondaire !");
    return;
  }

  currentIndex++;
  const interactor = manager.getSceneInteractor;
  if (!interactor) return;

  interactor.disposeCurrInteraction();
  manager.moveCameraTo(entry.zone);
  entry.callback();

  console.log("➡️ FORWARD vers zone :", entry.zone);
}
