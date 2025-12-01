import { useEffect, useRef } from 'react';
import { SceneManager } from './scene/SceneManager';
import { useAuth } from "./auth/context";
import {handlePopState} from './CameraHistory';

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
  const handlePop = (event: PopStateEvent) => {
    handlePopState(managerRef.current!, event.state);
  };

  window.addEventListener("popstate", handlePop);
  return () => window.removeEventListener("popstate", handlePop);
}, []);



  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
};

export default BabylonScene;

