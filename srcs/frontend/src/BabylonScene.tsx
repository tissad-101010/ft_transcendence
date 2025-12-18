import { useEffect, useRef, useState } from 'react';
import { SceneManager } from './scene/SceneManager';
import { useAuth } from "./auth/context";
import {handlePopState} from './CameraHistory';

const BabylonScene = () => {
  const { user, isAuthenticated, pending2FA, isLoading } = useAuth();
  const canvasRef = useRef(null);
  const managerRef = useRef<SceneManager | null>(null);
  const [managerReady, setManagerReady] = useState(false);

  // Initialisation et nettoyage du SceneManager
  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const manager = new SceneManager(canvasRef.current);
    managerRef.current = manager;
    let isMounted = true;

    (async () => {
      await manager.setupEnvironment();
      if (!isMounted) {
        return;
      }
      manager.startRenderLoop();
      setManagerReady(true);
    })();

    return () => {
      isMounted = false;
      setManagerReady(false);
      manager.cleanRender();
      managerRef.current = null;
    };
  }, []);

  // Propagation de l'utilisateur courant vers UserX quand prêt ET session chargée
  useEffect(() => {
    if (isAuthenticated && user && managerRef.current) {
      managerRef.current.setUser = user;
    }
    if (managerRef.current) {
      managerRef.current.setUser = user;
    }
  }, [user, managerReady, isLoading]);

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

