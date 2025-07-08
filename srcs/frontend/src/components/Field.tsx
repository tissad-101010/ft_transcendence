import { useEffect, useRef } from 'react';

import {pong} from '../classes/GameLogic.ts'

function Field() {
    const canvasRef = useRef(null);

    useEffect(() => {
        pong();
        // Exemple : remplir le canvas en rouge
    }, []);

    return (
        <canvas id="bkgdPong" ref={canvasRef} width={1280} height={720}></canvas>
    );
}

export default Field;