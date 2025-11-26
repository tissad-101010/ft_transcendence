// import { useEffect, useRef } from 'react';
// import { SceneManager } from './scene/SceneManager';
// import { useAuth } from "./auth/context";

// const BabylonScene = () => {
//   const { user, isAuthenticated } = useAuth();
//   const canvasRef = useRef(null);
//   const managerRef = useRef<SceneManager | null>(null);

//   // Création une seule fois
//   useEffect(() => {
//     if (!canvasRef.current) return;

//     const manager = new SceneManager(canvasRef.current);
//     managerRef.current = manager;

//     (async () => {
//       await manager.setupEnvironment();
//       manager.startRenderLoop();
//     })();

//     return () => {
//       manager.cleanRender();
//     };
//   }, []);

//   // Mise à jour de l'utilisateur sans recréer la scène
//   useEffect(() => {
//     if (isAuthenticated && user && managerRef.current) {
//       managerRef.current.setUser = user;
//     }
//   }, [isAuthenticated, user]);

//   return (
//     <canvas
//       ref={canvasRef}
//       style={{ width: "100%", height: "100%", display: "block" }}
//     />
//   );
// };

// export default BabylonScene;

import { useEffect, useRef } from 'react';
import { SceneManager } from './scene/SceneManager';
import { useAuth } from "./auth/context";
import { cameraHistory, back, forward, currentIndex, setCurrentIndex } from './CameraHistory';

const BabylonScene = () => {
  const { user, isAuthenticated } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const managerRef = useRef<SceneManager | null>(null);

  // ---------- CRÉATION DE LA SCÈNE ----------
  useEffect(() => {
    if (!canvasRef.current) return;

    const manager = new SceneManager(canvasRef.current);
    managerRef.current = manager;

    (async () => {
      await manager.setupEnvironment();
      manager.startRenderLoop();
    })();

    return () => manager.cleanRender();
  }, []);

  // ---------- BACK/FORWARD NAVIGATION ----------
  useEffect(() => {
    const handlePop = () => {
      if (!managerRef.current) return;
      const state = window.history.state?.cameraState;
      if (!state) return;

      // Cherche l'index correspondant à l'état actuel
      const newIndex = cameraHistory.findIndex(item => item.zone === state);
      if (newIndex === -1) return;

      if (newIndex < currentIndex) {
        back(managerRef.current);
      } else if (newIndex > currentIndex) {
        forward(managerRef.current);
      }

      setCurrentIndex(newIndex);
    };

    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  // ---------- MISE À JOUR UTILISATEUR ----------
  useEffect(() => {
    if (isAuthenticated && user && managerRef.current) {
      managerRef.current.setUser = user;
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

    // public getAllZoneMeshes(): AbstractMesh[] {
    //     // Récupère toutes les valeurs de l'enum ZoneName (chaînes)
    //     const zoneNamesAsStrings: string[] = ["stands", "border", "furniture", "buttonPoolExit0"];
    //     // const zoneNamesAsStrings: string[] = ["stands", "border", "furniture", "buttonPoolExit0"];
    //     // const zoneNamesAsStrings: string[] = Object.values(ZoneName);
    //     // console.log("voici les zones name dans mon ")
    //     // Convertit chaque nom en AbstractMesh via le meshMap
    //     const meshes: AbstractMesh[] = zoneNamesAsStrings
    //         .map(name => this.meshMap[name])
    //         .filter((m): m is AbstractMesh => m !== undefined); // filtre les undefined

    //     return meshes;
    // }
