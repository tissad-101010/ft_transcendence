import { useEffect, useRef } from 'react';

import Pong3DScene from '../classes/Pong3DScene.ts';

import GameLogic from '../classes/GameLogic.ts'

function Field() {
    const pong3D = useRef<HTMLCanvasElement | null>(null);
    useEffect(() => {
        if (pong3D.current) {
            const rules = {
                scoreMax: 3,
                timeLimit: 5,
                ballSpeed: 8,
                playerSpeed: 10,
                allowPause: true,
                countDownGoalTime: 3
            };
            const game = new GameLogic(rules);
            const scene = new Pong3DScene(pong3D.current, game);
            scene.init();
            scene.start();
            return () => {
                scene.dispose(); // Clean up si démonté
            };
        }
    }, []);

    return (
        <canvas id="bkgdPong" ref={pong3D} width={1280} height={720}></canvas>
    );
}

export default Field;