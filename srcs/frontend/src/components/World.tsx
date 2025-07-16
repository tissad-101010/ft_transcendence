import { useEffect, useRef } from 'react';

import World3D from '../classes/World3D.ts';
import WorldLogic from '../classes/WorldLogic.ts';

function World() {
    const worldCanvas = useRef<HTMLCanvasElement | null>(null);
    useEffect(() => {
        if (!worldCanvas.current) return;

        const canvas = worldCanvas.current;

        const initScene = async () => {
            const context = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
            if (!context) {
                console.error("WebGL context not supported or canvas not ready");
                return;
            }

            const worldMesh = 
            {
                folder: "/babylon/",
                file: "scene.glb"
            };

            const world = new WorldLogic();
            const scene = new World3D(world, canvas, worldMesh);

            // const rules = {
            //     scoreMax: 10,
            //     timeLimit: 5,
            //     ballSpeed: 1,
            //     playerSpeed: 3,
            //     allowPause: true,
            //     countDownGoalTime: 1,
            // };

            // const game = new GameLogic(rules);
            // scene = new Pong3DScene(canvas, game);
            await scene.init();
            scene.start();
        };

        // Différer d'un frame pour que le canvas soit prêt
        const rafId = requestAnimationFrame(initScene);

        return () => {
            // if (scene) {
                // scene.dispose();
            // }
            cancelAnimationFrame(rafId);
        };
    }, []);

    return (
        <>
        <canvas id="worldCanvas" ref={worldCanvas} style={{ width: '100%', height: '99.9vh' }}></canvas>
        <div id="camPosition" style={{
            position: 'absolute',
            top: 10,
            left: 10,
            background: 'rgba(0,0,0,0.5)',
            color: 'white',
            padding: '5px',
            fontFamily: 'monospace',
            zIndex: 10}}>
        </div>
    </>
);
}

export default World;