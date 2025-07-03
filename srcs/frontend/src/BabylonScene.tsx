import { useEffect, useRef } from 'react';
import {
  Engine,
  Scene,
  ArcRotateCamera,
  FreeCamera,
  Vector3,
  PBRMaterial,
  HemisphericLight,
  SceneLoader,
  Color3,
  MeshBuilder,
  CubeTexture,
} from '@babylonjs/core';
// import '@babylonjs/loaders/environment'; // important pour charger .env
import '@babylonjs/loaders/glTF'; // important : chargeur pour .glb et .gltf

const BabylonScene = () => {
    const canvasRef = useRef(null);
    useEffect(() => {
        if (!canvasRef.current) return;

        const engine = new Engine(canvasRef.current, true);
        const scene = new Scene(engine);

        // Crée une caméra pour pouvoir regarder la scène (même si tu ne veux rien d'autre)
        // const camera = new ArcRotateCamera(
        // "camera",
        // Math.PI / 2,
        // Math.PI / 4,
        // 10,
        // Vector3.Zero(), //tourner autout de l origine
        // scene
        // );


        const camera = new FreeCamera("freeCamera", new Vector3(0, 5, -10), scene);
        camera.attachControl(canvasRef.current, true);
        camera.speed = 0.5;

        // Charge la texture HDR (.env) et l'assigne à la scène
        const hdrTexture = CubeTexture.CreateFromPrefilteredData("/background.env", scene);
        scene.environmentTexture = hdrTexture;

        // Crée la skybox avec la texture HDR, taille 1000, parametre intensite HDRI
        scene.createDefaultSkybox(hdrTexture, true, 1000, 0);

      //----------------------------TEST IMPORT TSHIRT----------------------------
      
        SceneLoader.Append("/vestiary/", "tableVestiary.glb", scene);
        SceneLoader.Append("/vestiary/", "structVestiary.glb", scene);
        SceneLoader.Append("/vestiary/", "maillot.glb", scene);
          // const myMesh = scene.getMeshByName("shirt");
        //   if (myMesh){
        //     // fetch('http://localhost:3001/profile') //appel vers le backend via CORS
        //     // .then((response) => {
        //     //   if (!response.ok)
        //     //     throw new Error ("Error network");
        //     //   return response.json(); //parsing de la requete
        //     // })

        //     // .then((userData) => { //obligatoire pour acceder au contenu JSON
        //     //   const material = new PBRMaterial("userMat", scene);
        //     //   material.albedoColor = new Color3(1, 0, 0);
        //     //   myMesh.material = material;
        //     // })

        //     // .catch((error) => {
        //     //   console.error("Erreur fetch:", error);
        //     // });

        //     // scene.meshes.forEach((mesh, index) => {
        //     // console.log(`Mesh ${index}:`, mesh.name);
        //     // }
        //   // )}
        // });



        // Boucle de rendu
        engine.runRenderLoop(() => {
        scene.render();
        });

        // Gestion du redimensionnement
        window.addEventListener("resize", () => {
        engine.resize();
        });

        // Nettoyage
        return () => {
        engine.dispose();
        window.removeEventListener("resize", () => {
            engine.resize();
        });
        };
    }, []);

    return <canvas ref={canvasRef} style={{ width: '100%', height: '100vh' }} />;

};
export default BabylonScene;