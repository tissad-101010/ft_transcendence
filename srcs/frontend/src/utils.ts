import { 
    Vector3, 
    Scene, 
    PBRMaterial, 
    DynamicTexture, 
    Color3, 
    AbstractMesh 
} from '@babylonjs/core';



import { ZoneName } from './config.ts';
import { TournamentParticipant } from './pong/Tournament.ts';
import { Friend } from './friends/Friend.ts';

export const API_URL = window.__ENV__.BACKEND_URL;
export const WS_URL = window.__ENV__.WS_URL;

export function getApiUrl()
{
    const host = window.location.hostname;
    return (`https://${host}:8443`);
}

/***********************
 *       INTERFACES    *
 ***********************/
export interface Player {
    id: number;
    login: string;
}

interface GroupConfig {
    meshes: AbstractMesh[];
    groupSize: number;
    currentIndex: number;
}

/***********************
 *   CONFIG GLOBAL     *
 ***********************/
export const groupConfigs: Record<ZoneName.TSHIRT | ZoneName.SEAT | ZoneName.LOUNGE, GroupConfig> = {
    tshirt: {
        meshes: [],
        groupSize: 10,
        currentIndex: 0
    },
    chair: {
        meshes: [],
        groupSize: 4,
        currentIndex: 0
    },
    lounge: {
        meshes: [],
        groupSize: 6,
        currentIndex: 0
    }
};

/***********************
 *   UTILITAIRES       *
 ***********************/

export function shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export function normalizeAngleRad(angle: number): number {
    const twoPI = Math.PI * 2;
    angle = angle % twoPI;
    if (angle > Math.PI) angle -= twoPI;
    if (angle < -Math.PI) angle += twoPI;
    return angle;
}

export function normalizeRotation(rotation: Vector3): Vector3 {
    const r = rotation.clone();
    r.x = normalizeAngleRad(r.x);
    r.y = normalizeAngleRad(r.y);
    r.z = normalizeAngleRad(r.z);
    return r;
}

/***********************
 *   AFFICHAGE JOUEURS *
 ***********************/
export function displayPlayers(scene: Scene, players: TournamentParticipant[], meshes: AbstractMesh[]) {
    meshes.forEach((mesh, index) => {
        const mat = new PBRMaterial(`mat_${mesh.name}`, scene);
        mat.metallic = 0.0;
        mat.roughness = 0.4;

        const dynTex = new DynamicTexture(`dynTex_${mesh.name}`, { width: 1024, height: 1024 }, scene, true);
        const ctx = dynTex.getContext();
        ctx.clearRect(0, 0, 1024, 1024);

        const player = players[index];
        if (player) {
            // Vérifier que le participant a toutes les propriétés requises
            if (player.id === undefined || player.id === null) {
                console.warn(`Participant à l'index ${index} n'a pas d'id défini:`, player);
                mat.albedoColor = new Color3(0.5, 0.5, 0.5); // couleur grise pour les participants invalides
                dynTex.drawText(player.alias || "?", null, 280, "bold 80px Arial", "white", "transparent", true);
                dynTex.drawText("?", null, 600, "bold 250px Arial", "white", "transparent", true);
            } else {
                if (!player.eliminate)
                    mat.albedoColor = new Color3(1.0, 0.5, 0.4); // couleur normale
                else
                    mat.albedoColor = new Color3(0.5, 1, 0.4); // couleur éliminé
                dynTex.drawText(player.alias || player.login || "?", null, 280, "bold 80px Arial", "white", "transparent", true);
                dynTex.drawText(player.id.toString(), null, 600, "bold 250px Arial", "white", "transparent", true);
            }
        } else {
            mat.albedoColor = new Color3(0.25, 0.9, 0.9); // couleur alternative
        }

        dynTex.update();
        mat.emissiveTexture = dynTex;
        mat.emissiveColor = Color3.White();
        mesh.material = mat;
    });
}

/***********************
 *   GESTION GROUPES   *
 ***********************/
export function getTotalGroups(type: ZoneName.TSHIRT | ZoneName.SEAT | ZoneName.LOUNGE, totalPlayers ?: number): number {
    const config = groupConfigs[type];
    if (!config.meshes) return 0;
    const count = totalPlayers ?? config.meshes.length;
    return Math.ceil(count / config.groupSize);
}

export function getCurrentGroup(type: ZoneName.TSHIRT | ZoneName.SEAT | ZoneName.LOUNGE): number {
    return groupConfigs[type].currentIndex;
}

/***********************
 *  SET CURRENT GROUP   *
 ***********************/
export function setCurrentGroup(
    type: ZoneName.TSHIRT | ZoneName.SEAT | ZoneName.LOUNGE,
    value: number,
    items: Friend[] | TournamentParticipant[],
    scene: Scene
) {
    const config = groupConfigs[type];
    if (!config.meshes || config.meshes.length === 0) return;

    const totalGroups = Math.ceil(items.length / config.groupSize);
    config.currentIndex = ((value % totalGroups) + totalGroups) % totalGroups;

    const start = config.currentIndex * config.groupSize;

    const visibleItems: (Player | Friend | null | TournamentParticipant)[] = [];
    for (let i = 0; i < config.groupSize; i++) {
        visibleItems.push(items[start + i] || null);
    }

    config.meshes.forEach(mesh => mesh.setEnabled(true));

    if (type === ZoneName.TSHIRT)
        displayPlayers(scene, visibleItems as TournamentParticipant[], config.meshes);
     else
        displayFriendsWithEmpty(scene, visibleItems as Friend[], config.meshes);
}

/***********************
 *  AFFICHAGE AVEC EMPTY
 ***********************/

export function displayFriendsWithEmpty(scene: Scene, friends: Friend[], meshes: AbstractMesh[]) {
    meshes.forEach((mesh, index) => {
        const mat = mesh.material as PBRMaterial;
        if (!mat) return;

        // Crée ou récupère une DynamicTexture existante pour le login
        let dynTex = (mat as any)._loginTexture as DynamicTexture;
        if (!dynTex) {
            dynTex = new DynamicTexture(`dynTex_${mesh.name}`, { width: 1024, height: 1024 }, scene, true);
            (mat as any)._loginTexture = dynTex;
        }

        const ctx = dynTex.getContext();
        ctx.clearRect(0, 0, 1024, 1024);

        const friend = friends[index];
        if (friend) {
            dynTex.drawText(friend.getUsername, 150, 650, "bold 150px Arial", "white", "transparent", true);
            mat.emissiveColor = Color3.White(); // rose si ami
        } else {
            mat.emissiveColor = Color3.White(); // turquoise si vide
        }

        dynTex.update();
        mat.emissiveTexture = dynTex;
    });
}