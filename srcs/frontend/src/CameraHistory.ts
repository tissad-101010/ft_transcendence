import { SceneManager } from "./scene/SceneManager";
import { ZoneName } from "./config";

export interface CameraHistoryEntry {
  zone: ZoneName;
  callback: () => void; // Ce qui se passe quand on arrive sur la zone
}

// -------------------------
// HISTORIQUE INTERNE
// -------------------------
export const cameraHistory: CameraHistoryEntry[] = [];
export let currentIndex = -1;

// Zone active réelle (main ou secondary)
export let currentActiveZone: ZoneName | null = null;
export let currentZoneIsSecondary = false;

// -------------------------
// ZONES
// -------------------------
export const mainZones: ZoneName[] = [
  ZoneName.STANDS,
  ZoneName.LOCKER_ROOM,
  ZoneName.POOL,
  ZoneName.START,
];

export const secondaryZones: ZoneName[] = Object.values(ZoneName).filter(
  (z) => !mainZones.includes(z)
);

// -------------------------
// NAVIGATION PRINCIPALE
// -------------------------
export function navigateToZone(
  manager: SceneManager,
  zone: ZoneName,
  callback: () => void,
  addToHistory: boolean = true
) {
  const interactor = manager.getSceneInteractor;
  if (!interactor) return;

  currentActiveZone = zone;
  currentZoneIsSecondary = secondaryZones.includes(zone);

  console.log(
    currentZoneIsSecondary
      ? `🔹 SecondaryZone : ${zone}`
      : `🏷 MainZone active : ${zone}`
  );

  manager.moveCameraTo(zone);
  callback();

  if (!currentZoneIsSecondary && addToHistory) {
    const existingIndex = cameraHistory.findIndex((e) => e.zone === zone);
    if (existingIndex !== -1) {
      cameraHistory.splice(existingIndex, 1);
      if (existingIndex <= currentIndex) currentIndex--;
    }

    // **Ne pas supprimer l'historique après currentIndex si addToHistory = false**
    cameraHistory.splice(currentIndex + 1); // <-- garder uniquement pour addToHistory = true
    cameraHistory.push({ zone, callback });
    currentIndex++;

    window.history.pushState({ cameraState: zone }, "");

    console.log("📷 Historique mainZones :", cameraHistory.map((e) => e.zone));
    console.log("📌 currentIndex :", currentIndex);
  }
}


// -------------------------
// BACK / FORWARD NAVIGATEUR
// -------------------------
export function handlePopState(manager: SceneManager, state: any) {
  const zone = state?.cameraState as ZoneName;
  if (!zone) return;

  console.log("🔙 popstate détecté :", zone);

  // Bloquer BACK/Forward si on est dans une secondaryZone
  if (currentZoneIsSecondary) {
    console.log(
      "🚫 BACK/FORWARD navigateur bloqué : utilisateur dans secondaryZone"
    );
    return;
  }

  const index = cameraHistory.findIndex((e) => e.zone === zone);
  if (index === -1) return;

  if (index < currentIndex) back(manager);
  else if (index > currentIndex) forward(manager);
}

// -------------------------
// BACK / FORWARD INTERNES
// -------------------------
export function back(manager: SceneManager) {
  if (currentIndex <= 0) return;
  const interactor = manager.getSceneInteractor;
  if (!interactor) return;

  const entry = cameraHistory[currentIndex - 1];
  currentIndex--;
  currentActiveZone = entry.zone;
  currentZoneIsSecondary = false;

  const targetMesh = interactor.getMeshByZone(entry.zone);
  if (!targetMesh) return;

  console.log("⬅️ BACK vers :", entry.zone);

  interactor.handleMainZoneClick(targetMesh, true, false); // <-- ne pas ajouter à l'historique

  console.log("📷 Historique mainZones :", cameraHistory.map((e) => e.zone));
  console.log("📌 currentIndex :", currentIndex);
}

export function forward(manager: SceneManager) {
  if (currentIndex >= cameraHistory.length - 1) return;
  const interactor = manager.getSceneInteractor;
  if (!interactor) return;

  const entry = cameraHistory[currentIndex + 1];

  const targetMesh = interactor.getMeshByZone(entry.zone);
  if (!targetMesh) return;

  console.log("➡️ FORWARD vers :", entry.zone);

  // Incrémenter l'index AVANT la navigation
  currentIndex++;
  currentActiveZone = entry.zone;
  currentZoneIsSecondary = false;

  // Naviguer sans toucher à l'historique
  interactor.handleMainZoneClick(targetMesh, true, false);

  console.log("📷 Historique mainZones :", cameraHistory.map((e) => e.zone));
  console.log("📌 currentIndex :", currentIndex);
}
