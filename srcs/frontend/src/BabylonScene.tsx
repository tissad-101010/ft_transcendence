import { useEffect, useRef } from 'react';
import { SceneManager } from './scene/SceneManager.ts';
import "@babylonjs/loaders";

const BabylonScene = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!canvasRef.current) 
        return;
    const manager = new SceneManager(canvasRef.current);
    manager.setupEnvironment();
    manager.startRenderLoop();
    return () => {
      manager.cleanRender();
    };
  }, []);

  return       <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
      }}
    />

};
export default BabylonScene;