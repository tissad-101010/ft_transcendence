import {
  Scene,
  Vector3,
  Mesh,
  TransformNode,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Animation,
  HighlightLayer,
  ParticleSystem,
  Texture,
  ConeParticleEmitter,
  SphereParticleEmitter,
  Color4,
  PointLight
} from '@babylonjs/core';
import { 
  AdvancedDynamicTexture, 
  Rectangle, 
  Control,
  TextBlock,
  StackPanel,
  Button
} from "@babylonjs/gui";
import '@babylonjs/loaders/glTF'; // important : chargeur pour .glb et .gltf

import { ZoneName } from '../config.ts';
import GameLogic from './GameLogic.ts';
import PlayerLogic from './PlayerLogic.ts';
import BallLogic from './BallLogic.ts';
import { SceneManager } from '../scene/SceneManager.ts';

interface IPlayer
{
    logic: PlayerLogic,
    mesh: Mesh,
    size: Vector3 | null,
};

interface IBall
{
    logic: BallLogic,
    mesh: Mesh | null,
    size: Vector3 | null
    light: PointLight
};

interface IGame
{
    logic: GameLogic,
    mesh: Mesh | null,
    size: Vector3 | null
};

export default class Game3D
{
    private game: IGame | null;
    private players: IPlayer[];
    private ball: IBall | null;
    private sceneManager: SceneManager;
    private scene: Scene;
    private advancedTLeft: AdvancedDynamicTexture | null;
    private advancedTRight: AdvancedDynamicTexture | null;
    private advancedTTime: AdvancedDynamicTexture | null;
    private score1: TextBlock;
    private score2: TextBlock;
    private time: TextBlock;
    private highlights: HighlightLayer[];
    constructor(sceneManager: SceneManager)
    {
        this.game = null;
        this.players = [];
        this.ball = null;
        this.sceneManager = sceneManager;
        this.scene = this.sceneManager.getScene();
        this.advancedTLeft = null;
        this.advancedTRight = null;
        this.advancedTTime = null;
        this.highlights = [];
    };

    initPlayer(logic: PlayerLogic, index: number) : boolean
    {
        if (!this.game || !this.game.mesh)
            return (false);
        let box;
        try
        {
            box = MeshBuilder.CreateBox(
                "player" + index,
                {
                    width: 1,
                    height: 2,
                    depth: 5
                },
                this.scene
            );
            box.parent = this.game.mesh;
            const material = new StandardMaterial("materialPlayer" + index, this.scene);
            if (logic.getTeam === 1)
            {
                box.position = new Vector3(
                    (0 - this.game.size.x / 2) + (this.game.size.x / 10),
                    0,
                    0
                );
                material.diffuseColor = new Color3(0.6, 0.8, 1.0);
            }
            else
            {
                box.position = new Vector3(
                    (this.game.size.x / 2) - (this.game.size.x / 10),
                    0,
                    0
                );
                material.diffuseColor = new Color3(1, 0.7, 0.8);
            }
            box.isPickable = false;
            box.visibility = 1;
            box.material = material;
        } catch (error: unknown)
        {
            console.error("Error lors de la creation du mesh du player " + index);
            return (false);
        }
        this.players.push({
            logic: logic,
            mesh: box,
            size: this.getSizeMesh(box)
        });
        logic.setWidth = this.players[index].size.x;
        logic.setHeight = this.players[index].size.z;
        logic.setPosX = box.position.x;
        logic.setPosY = box.position.y;
        if (!this.game.logic.getField)
            return (false);
        logic.setField = this.game.logic.getField;
        return (true);
    };

    initField(logic: GameLogic) : boolean
    {
        console.log(this.scene);
        this.game = {
            logic: logic,
            mesh: this.scene.getMeshByName("field"),
            size: null
        };
        if (!this.game.mesh)
        {
            console.error("Error : field pas trouve");
            return (false);
        }
        this.game.size = this.getSizeMesh(this.game.mesh);
        if (!this.game.size)
        {
            console.error("Error : size pas recupee dans initField");
            return (false);
        }
        logic.setField = {width: this.game.size.x, height: this.game.size.z};
        return (true);
    };

    initBall(logic: BallLogic) : boolean
    {
        if (!this.game || !this.game.mesh)
            return (false);
        const mesh = this.scene.getMeshByName("ballPong");
        if (!mesh)
        {
            console.error("Error : ballPong pas trouve");
            return (false);
        }
        this.ball = {
            logic: logic,
            mesh: mesh,
            size: null,
            light: null
        };
        this.ball.mesh.parent = this.game.mesh;
        this.ball.size = this.getSizeMesh(this.ball.mesh);
        if (!this.ball.size)
        {
            console.error("Error : size pas recuperee dans initBall");
            return (false);
        }

        this.ball.mesh.position = new Vector3(0, this.ball.size.z, 0);
        
        // Matériau simple
        // const mat = new StandardMaterial("ballMat", this.scene);
        // mat.diffuseColor = new Color3(0.8, 0.8, 0.8);  
        // mat.specularColor = new Color3(0.1, 0.1, 0.1);        
        // mat.emissiveColor = new Color3(0.8, 0.8, 0.8);   
        // this.ball.mesh.material = mat;

        // // Lumière attachée à la balle
        // this.ball.light = new PointLight(
        //     "ballLight",
        //     this.ball.mesh.position.add(new Vector3(0, 0.1, 0)), 
        //     this.scene
        // );
        // this.ball.light.diffuse = new Color3(1, 1, 1); 
        // this.ball.light.specular = new Color3(1, 1, 1);
        // this.ball.light.intensity = 3;                 
        // this.ball.light.range = 8;                      

        if (!this.game.logic.getField)
            return (false);
        logic.setField = this.game.logic.getField;
        return (true);
    };

    initTimeBefore()
    {
        this.advancedTTime = AdvancedDynamicTexture.CreateForMesh(
            this.sceneManager.getMesh("scoreBoard")[0],
            1024, 1024,
            true
        );

        const panel = new Rectangle();
        panel.width = "100%";
        panel.height = "100%";
        panel.background = "white";
        panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this.advancedTTime.addControl(panel);

        const h = new HighlightLayer("hTime", this.scene);
        h.addMesh(this.sceneManager.getMesh("scoreBoard")[0], new Color3(1, 1, 1));
        h.blurHorizontalSize = 1;
        h.blurVerticalSize = 1;
        this.highlights.push(h);

        this.time = new TextBlock();
        this.time.text = this.game?.logic.getTime;
        this.time.fontSize = 500;
        this.time.color = "black";
        this.time.height = "100%";
        this.time.width = "100%";
        this.time.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.time.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.time.top = 50;
        panel.addControl(this.time);
    }

    initScoreBoard() {
        // Left scoreboard
        this.advancedTLeft = AdvancedDynamicTexture.CreateForMesh(
            this.sceneManager.getMesh("scoreBoard")[1],
            1024, 1024,
            true
        );

        // Fond blanc fixe
        const panelLeft = new Rectangle();
        panelLeft.width = "100%";
        panelLeft.height = "800px";
        panelLeft.background = "rgba(233, 165, 191, 1)";
        panelLeft.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        panelLeft.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this.advancedTLeft.addControl(panelLeft);

        const hLeft = new HighlightLayer("hLeft", this.scene);
        hLeft.addMesh(this.sceneManager.getMesh("scoreBoard")[1], new Color3(1, 1, 1));
        hLeft.blurHorizontalSize = 1;
        hLeft.blurVerticalSize = 1;
        this.highlights.push(hLeft);

        // Score initial
        this.score1 = new TextBlock();
        this.score1.text = this.game?.logic.getScore1.toString() ?? "0";
        this.score1.fontSize = 750;
        this.score1.color = "rgba(91, 113, 201, 1)";
        this.score1.width = "100%";
        this.score1.height = "100%";
        // this.score1.fontFamily = "Jersey 15";
        this.score1.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.score1.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this.score1.top = 0;
        panelLeft.addControl(this.score1);

        // Right scoreboard
        this.advancedTRight = AdvancedDynamicTexture.CreateForMesh(
            this.sceneManager.getMesh("scoreBoard")[2],
            1024, 1024,
            true
        );

        const panelRight = new Rectangle();
        panelRight.width = "100%";
        panelRight.height = "800px";
        panelRight.background = "rgba(233, 165, 191, 1)";
        panelRight.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        panelRight.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this.advancedTRight.addControl(panelRight);

        const hRight = new HighlightLayer("hRight", this.scene);
        hRight.addMesh(this.sceneManager.getMesh("scoreBoard")[2], new Color3(1, 1, 1));
        hRight.blurHorizontalSize = 1;
        hRight.blurVerticalSize = 1;
        this.highlights.push(hRight);

        this.score2 = new TextBlock();
        this.score2.text = this.game?.logic.getScore2.toString() ?? "0";
        this.score2.fontSize = 750;
        this.score2.color = "rgba(91, 113, 201, 1)";
        this.score2.width = "100%";
        // this.score2.fontFamily = "Jersey 15";
        this.score2.height = "100%";
        this.score2.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.score2.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this.score2.top = 0;
        panelRight.addControl(this.score2);
    }

    updateScoreBoard() {
        if (!this.score1 || !this.score2 || (this.game?.logic.getScored !== 1 && this.game?.logic.getScored !== 2)) return;

        // Nouveau score
        const newScore = new TextBlock();
        if (this.game?.logic.getScored === 1)
            newScore.text = this.game?.logic.getScore1.toString() ?? "0";
        else
            newScore.text = this.game?.logic.getScore2.toString() ?? "0";
        newScore.fontSize = 750;
        if (this.game?.logic.getScored === 1)
            newScore.color = "rgba(64, 90, 195, 1)";
        else
            newScore.color = "rgba(202, 86, 196, 1)";
        newScore.width = "100%";
        newScore.height = "100%";
        // newScore.fontFamily = "Jersey 15";
        newScore.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        newScore.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        newScore.top = -800; // commence au-dessus

        if (this.game?.logic.getScored === 1)
            this.score1.parent?.addControl(newScore);
        else
            this.score2.parent?.addControl(newScore);

        // Animation ancien score descend
        const animOut = new Animation("scoreDown", "top", 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
        animOut.setKeys([
            { frame: 0, value: 0 },
            { frame: 60, value: 800 } // descend vers le bas
        ]);
        
        let oldScore;
        if (this.game?.logic.getScored === 1)
        {
            oldScore = this.score1;
            this.score1 = newScore;
        } else
        {
            oldScore = this.score2;
            this.score2 = newScore;
        }

        // Animation ancien score descend
        oldScore.animations = [animOut];
        this.scene.beginAnimation(oldScore, 0, 60, false, 1, () => {
            oldScore.dispose(); // supprime l’ancien après l’animation
        });

        // Animation nouveau score descend
        const animIn = new Animation("scoreIn", "top", 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
        animIn.setKeys([
            { frame: 0, value: -800 },
            { frame: 60, value: 0 } // arrive au centre
        ]);
        newScore.animations = [animIn];
        this.scene.beginAnimation(newScore, 0, 60, false);

        // Met à jour la référence
        if (this.game?.logic.getScored === 1)
            this.score1 = newScore;
        else
            this.score2 = newScore;
    }

    updateTimeBefore()
    {
        if (this.game?.logic.getTime == parseInt(this.time.text, 10))
            return;

        const oldTime = this.time;

        // Nouveau texte
        const newTime = new TextBlock();
        newTime.text = this.game?.logic.getTime;
        newTime.color = "black";
        newTime.width = "100%";
        newTime.height = "100%";
        newTime.fontSize = 500;
        newTime.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        newTime.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        newTime.alpha = 0; // invisible au départ
        newTime.top = 50;
        this.time.parent.addControl(newTime);

        // Animation de disparition de l'ancien (fade out + petit shrink)
        const animFadeOut = new Animation("fadeOut", "alpha", 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
        animFadeOut.setKeys([
            { frame: 0, value: 1 },
            { frame: 15, value: 0 } // disparition rapide
        ]);

        const animShrink = new Animation("shrink", "fontSize", 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
        animShrink.setKeys([
            { frame: 0, value: 175 },
            { frame: 15, value: 100 } // léger rétrécissement
        ]);

        oldTime.animations = [animFadeOut, animShrink];
        this.scene.beginAnimation(oldTime, 0, 15, false, 1, () => {
            oldTime.dispose();
        });

        // Animation d’apparition du nouveau (fade in + petit grow)
        const animFadeIn = new Animation("fadeIn", "alpha", 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
        animFadeIn.setKeys([
            { frame: 0, value: 0 },
            { frame: 15, value: 1 }
        ]);

        const animGrow = new Animation("grow", "fontSize", 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
        animGrow.setKeys([
            { frame: 0, value: 100 },
            { frame: 15, value: 175 }
        ]);

        newTime.animations = [animFadeIn, animGrow];
        this.scene.beginAnimation(newTime, 0, 15, false);

        this.time = newTime;
    }

    // RETOURNE UN VECTOR3 QUI CONTIENT LA TAILLE DE L'ELEMENT DONNE EN PARAMETRE
    getSizeMesh(mesh: Mesh | TransformNode) : Vector3
    {
        if (mesh instanceof Mesh)
        {
            const box = mesh.getBoundingInfo().boundingBox;
            const min = box.minimumWorld;
            const max = box.maximumWorld;
            return (max.subtract(min));
        } else if (mesh instanceof TransformNode)
        {
            const {min, max} = mesh.getHierarchyBoundingVectors();
            return (max.subtract(min));
        }
        return (null);
    }

    

    // MET A JOUR LA POSITION DU PLAYER
    updatePlayer(player: IPlayer)
    {
        player.mesh.position = new Vector3(player.logic.getPosX, player.mesh.position.y, player.logic.getPosY);
    };

    // MET A JOUR LA POSITION DE LA BALLE
    updateBall(ball: IBall)
    {
        ball.mesh.position = new Vector3(ball.logic.getPosX, ball.mesh.position.y, ball.logic.getPosY);
        // ball.light.position.copyFrom(ball.mesh.getAbsolutePosition().add(new Vector3(0, 0.1, 0)));
    };

    showWinner(shouldReturnToMainMenu: boolean = false) {
        this.sceneManager.getSceneInteractor?.disableInteractions();
        this.sceneManager.moveCameraTo(ZoneName.WINNERPOV, () => {
            // this.sceneManager.getSceneInteractor?.enableInteractions();
        });

        const mesh = this.scene.getMeshByName("field");

        const emitterLeft = new TransformNode("emitterLeft", this.scene);
        emitterLeft.parent = mesh;
        emitterLeft.position = new Vector3(0, 0, -20);

        const emitterRight = new TransformNode("emitterRight", this.scene);
        emitterRight.parent = mesh;
        emitterRight.position = new Vector3(0, 0, 20);

        const createFirework = (startPos, colors) => {
            const rocketNode = new TransformNode("rocketNode", this.scene);
            rocketNode.parent = mesh;
            rocketNode.position = startPos.clone();

            const trail = new ParticleSystem("rocketTrail", 1000, this.scene);
            trail.particleTexture = new Texture("https://playground.babylonjs.com/textures/flare.png", this.scene);
            trail.emitter = rocketNode;
            trail.color1 = colors.color1;
            trail.color2 = colors.color2;
            trail.colorDead = new Color4(0, 0, 0, 0);
            trail.minSize = 0.1;
            trail.maxSize = 0.3;
            trail.emitRate = 150;
            trail.minEmitPower = 10;
            trail.maxEmitPower = 20;
            trail.gravity = new Vector3(0, -7, 0);
            trail.direction1 = new Vector3(0, 1, 0);
            trail.direction2 = new Vector3(0, 1, 0);
            trail.start();

            const riseTargetY = 10 + Math.random() * 15;
            const riseDuration = 1000 + Math.random() * 1000;
            const startY = rocketNode.position.y;
            const startTime = performance.now();

            const rise = () => {
                const t = (performance.now() - startTime) / riseDuration;
                if (t < 1) {
                    rocketNode.position.y = startY + t * riseTargetY;
                    requestAnimationFrame(rise);
                } else {
                    trail.stop();
                    const explosion = new ParticleSystem("explosion", 4000, this.scene);
                    explosion.particleTexture = new Texture("https://playground.babylonjs.com/textures/flare.png", this.scene);
                    explosion.emitter = rocketNode;
                    explosion.particleEmitterType = new SphereParticleEmitter(10);
                    explosion.color1 = colors.color1;
                    explosion.color2 = colors.color2;
                    explosion.colorDead = new Color4(0, 0, 0, 0);
                    explosion.minSize = 0.5;
                    explosion.maxSize = 1;
                    explosion.minLifeTime = 0.5;
                    explosion.maxLifeTime = 2.0;
                    explosion.minEmitPower = 10;
                    explosion.maxEmitPower = 20;
                    explosion.gravity = new Vector3(0, -7, 0);
                    explosion.emitRate = 1000;
                    explosion.start();
                    setTimeout(() => {
                        explosion.stop();
                        explosion.dispose();
                        trail.dispose();
                        rocketNode.dispose();
                    }, 2500);
                }
            };
            rise();
        };

        const leftColors = {
            color1: new Color4(0.6, 0.8, 1.0, 1.0),
            color2: new Color4(1.0, 0.7, 0.8, 1.0),
        };
        const rightColors = {
            color1: new Color4(1.0, 0.85, 0.5, 1.0),
            color2: new Color4(0.8, 0.5, 1.0, 1.0),
        };

        const leftPos = new Vector3(0, 0, -20);
        const rightPos = new Vector3(0, 0, 20);

        const interval = setInterval(() => {
            createFirework(leftPos, leftColors);
            createFirework(rightPos, rightColors);
        }, 2000);

        setTimeout(() => clearInterval(interval), 10000);

        this.showWinnerUI(
            this.game?.logic.getPlayers[this.game?.logic.getWinner - 1].getAlias,
            shouldReturnToMainMenu
        );
    }

    showWinnerUI(winnerName, shouldReturnToMainMenu: boolean = false) {
        const ui = AdvancedDynamicTexture.CreateFullscreenUI("WinnerUI", true, this.scene);

        const panel = new StackPanel();
        panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        panel.spacing = 10;
        ui.addControl(panel);

        const text = new TextBlock();
        text.text = `🏆 ${winnerName} a gagné ! 🏆`;
        text.color = "white";
        text.fontSize = 48;
        text.fontWeight = "bold";
        text.outlineColor = "black";
        text.outlineWidth = 4;
        panel.addControl(text);

        setTimeout(() => {
            if (this.sceneManager.getSceneInteractor)
            {
                this.highlights.forEach((h) => h.dispose());
                this.advancedTLeft.dispose();
                this.advancedTRight.dispose();
                this.advancedTTime.dispose();
                this.sceneManager.getSceneInteractor.disableInteractions();
                
                // Nettoyer les interfaces de tournoi/match amical si nécessaire
                if (shouldReturnToMainMenu && this.sceneManager.getUserX) {
                    // Nettoyer le tournoi et le match pour éviter les interfaces restantes
                    this.sceneManager.getUserX.setTournament = null;
                    this.sceneManager.getUserX.setMatch = null;
                }
                
                // Rediriger vers le menu principal si tournoi terminé ou match amical
                const targetZone = shouldReturnToMainMenu ? ZoneName.START : ZoneName.LOCKER_ROOM;
                this.sceneManager.moveCameraTo(targetZone, () => {
                    this.sceneManager.setSpecificMesh(false);
                    this.sceneManager.getSceneInteractor?.enableInteractions();
                    this.sceneManager.getLights().turnOnLights();
                    
                    // Si on retourne au menu principal, déclencher la navigation
                    if (shouldReturnToMainMenu) {
                        const startMesh = this.scene.getMeshByName(ZoneName.START);
                        if (startMesh && this.sceneManager.getSceneInteractor) {
                            this.sceneManager.getSceneInteractor.handleMainZoneClick(startMesh, true);
                        }
                    }
                });
            }
        }, 12000);
    }

    // MET A JOUR TOUS LES ELEMENTS 3D
    update(keys: Set<string>) : void
    {
        // Update logic
        let goal = {b: false};
        this.game?.logic.update(keys);
        if (this.game?.logic.getState === 3)
            this.showWinner();
        else
        {
            // Update visuel
            this.players.forEach((player) => {
                this.updatePlayer(player);
            });
            if (this.ball && this.ball.mesh)
                this.updateBall(this.ball);
            if (this.game?.logic.getScored !== 0)
                this.updateScoreBoard();
            if (this.game?.logic.getState === 2)
                this.updateTimeBefore();
            ////////////////
        }
    };

    get getPlayers()
    {
        return (this.players);
    }

    get getField()
    {
        return (this.game?.mesh);
    }

    get getBall()
    {
        return (this.ball?.mesh);
    }

    get getFieldSize()
    {
        return (this.game?.size);
    }

    get getBallSize()
    {
        return (this.ball?.size);
    }
};