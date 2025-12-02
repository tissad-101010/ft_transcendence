import { useEffect, useRef, useState } from 'react';
import { SceneManager } from './scene/SceneManager';
import { useAuth } from "./auth/context";

const BabylonScene = () => {
  const { user, isLoading } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
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
    if (!managerReady || !managerRef.current || isLoading) {
      return;
    }
    console.log("BabylonScene: propagation de l'utilisateur vers UserX:", user);
    managerRef.current.setUser = user;
  }, [user, managerReady, isLoading]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
};

export default BabylonScene;
