import { useEffect, useRef } from 'react';

import Pong3DScene from '../classes/Pong3DScene.ts';

import GameLogic from '../classes/Game/GameLogic.js'

function Field() {
    const pong3D = useRef<HTMLCanvasElement | null>(null);
    useEffect(() => {
        if (!pong3D.current) return;

        let scene: Pong3DScene | null = null;
        const canvas = pong3D.current;

        const initScene = async () => {
            const context = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
            if (!context) {
                console.error("WebGL context not supported or canvas not ready");
                return;
            }

            const rules = {
                scoreMax: 10,
                timeLimit: 5,
                ballSpeed: 1,
                playerSpeed: 3,
                allowPause: true,
                countDownGoalTime: 1,
            };

            const game = new GameLogic(rules);
            scene = new Pong3DScene(canvas, game);
            await scene.init();
            scene.start();
        };

        // Différer d'un frame pour que le canvas soit prêt
        const rafId = requestAnimationFrame(initScene);

        return () => {
            if (scene) {
                scene.dispose();
            }
            cancelAnimationFrame(rafId);
        };
    }, []);

    return (
        <>
        <canvas id="bkgdPong" ref={pong3D} style={{ width: '100%', height: '99vh' }}></canvas>
        {/* <div id="camPosition" style={{
            position: 'absolute',
            top: 10,
            left: 10,
            background: 'rgba(0,0,0,0.5)',
            color: 'white',
            padding: '5px',
            fontFamily: 'monospace',
            zIndex: 10}}>
        </div> */}
    </>
);
}

export default Field;