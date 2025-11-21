import { useEffect, useRef } from 'react';
import { SceneManager } from './scene/SceneManager';
import { useAuth } from "./auth/context";

const BabylonScene = () => {
  const { user, isAuthenticated, pending2FA,  } = useAuth();
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
      console.log("User updated in SceneManager:", user);
      console.log("2FA pending status:", pending2FA);
      console.log("Is authenticated:", isAuthenticated);
      console.log("Current user in SceneManager:", managerRef.current.getUserX);
    }
  }, [isAuthenticated, user]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
};

export default BabylonScene;
