import { useEffect, useRef } from 'react';
import { SceneManager } from './scene/SceneManager';
import { useAuth } from "./auth/context";
import { back, forward, cameraHistory, currentIndex} from './CameraHistory';

const BabylonScene = () => {
  const { user, isAuthenticated } = useAuth();
  const canvasRef = useRef(null);
  const managerRef = useRef<SceneManager | null>(null);

  // Création une seule fois
  useEffect(() => {
    if (!canvasRef.current) return;

    const manager = new SceneManager(canvasRef.current);
    managerRef.current = manager;

    (async () => {
      await manager.setupEnvironment();
      manager.startRenderLoop();
    })();

    return () => {
      manager.cleanRender();
    };
  }, []);

  // Mise à jour de l'utilisateur sans recréer la scène
  useEffect(() => {
    if (isAuthenticated && user && managerRef.current) {
      managerRef.current.setUser = user;
    }
  }, [isAuthenticated, user]);

      // Gestion back/forward navigateur
useEffect(() => {
  const handlePopState = (event: PopStateEvent) => {
    if (!managerRef.current) return;

    const state = event.state?.cameraState;
    if (!state) return;

    console.log("📌 popstate détecté - zone :", state);

    // Vérifie si la zone est dans l'historique
    const index = cameraHistory.findIndex(e => e.zone === state);
    console.log("📍 index demandé :", index);
    console.log("📍 index actuel :", currentIndex);

    if (index === -1) {
      console.log("🚫 Zone non enregistrée : back/forward bloqué");
      // Optionnel : on peut afficher un message
      alert("⚠️ Cette zone n'est pas dans l'historique !");
      return; // NE FAIT RIEN si la zone n'est pas dans l'historique
    }

    // Bloquer le back si déjà au début
    if (currentIndex === 0 && index <= currentIndex) {
      console.log("⛔ BACK impossible : déjà au début de l'historique");
      alert("⛔ Vous êtes déjà au début de l'historique !");
      return;
    }

    if (index < currentIndex) {
      console.log("⬅️ BACK navigateur exécuté");

      // Bloque l'interaction pendant le back
      managerRef.current?.getSceneInteractor?.disableInteractions?.();
      back(managerRef.current);
      managerRef.current?.getSceneInteractor?.enableInteractions?.();
    } 
    else if (index > currentIndex) {
      console.log("➡️ FORWARD navigateur exécuté");

      managerRef.current?.getSceneInteractor?.disableInteractions?.();
      forward(managerRef.current);
      managerRef.current?.getSceneInteractor?.enableInteractions?.();
    }
  };

  window.addEventListener("popstate", handlePopState);
  return () => window.removeEventListener("popstate", handlePopState);
}, []);



  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
};

export default BabylonScene;

