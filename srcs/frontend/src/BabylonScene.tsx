import { useEffect, useRef } from 'react';
import { SceneManager } from './scene/SceneManager';
import { useAuth } from "./auth/context";
import { back, forward, cameraHistory, currentIndex } from './CameraHistory';

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

      const index = cameraHistory.findIndex(e => e.zone === state);
      if (index === -1) return;

      if (index < currentIndex) {
        back(managerRef.current);
      } else if (index > currentIndex) {
        forward(managerRef.current);
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

