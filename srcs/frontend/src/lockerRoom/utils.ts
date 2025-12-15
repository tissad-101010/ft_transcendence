import {
    AbstractMesh,
    Animation,
    Scene ,
    Texture,
    StandardMaterial,
    DynamicTexture,
    Color3,
    Vector3,
    CubicEase,
    EasingFunction,
} from '@babylonjs/core';

export interface Participant
{
    login: string,
    alias: string | null,
    status: number
}

export interface UIData
{
    title: {
        width: string,
        fontSize: number,
        fontFamily: string,
        color: string
    },
    text: {
        color: string,
        fontSize: number,
        fontFamily: string,
    },
    inputText: {
        fontSize: number,
        fontFamily: string,
        color: string,
        background: string,
        focusedBackground: string,
        thickness: number
    },
    button:
    {
        color: string,
        background: string,
        clickedBackground: string,
        hoveredBackground: string,
        thickness: number
    }
}

/**************************************************
 *                    TV                          *
 **************************************************/
export function pressButtonAnimation(
    mesh: AbstractMesh,
    scene: Scene,
    onComplete?: () => void
) : void 
{
    const createScaleAnim = (axis: "x" | "y" | "z") => {
        return new Animation(
            `scale${axis.toUpperCase()}Anim`,
            `scaling.${axis}`,
            60,
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CONSTANT
        );
    };

    const posAnim = new Animation("posAnim", "position.z", 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
    const originalZ = mesh.position.z;

    const scaleKeyframes = [
        { frame: 0, value: 1 },
        { frame: 5, value: 0.7 },
        { frame: 10, value: 1 }
    ];
    const posKeyframes = [
        { frame: 0, value: originalZ },
        { frame: 5, value: originalZ - 0.05},
        { frame: 10, value: originalZ }
    ];

    const scaleX = createScaleAnim("x"); scaleX.setKeys(scaleKeyframes);
    const scaleY = createScaleAnim("y"); scaleY.setKeys(scaleKeyframes);
    const scaleZ = createScaleAnim("z"); scaleZ.setKeys(scaleKeyframes);
    posAnim.setKeys(posKeyframes);

    mesh.animations = [scaleX, scaleY, scaleZ, posAnim];

    const anim = scene.beginAnimation(mesh, 0, 10, false);
    if (onComplete) {
        anim.onAnimationEnd = onComplete;
    }
}

export function applyTextureToMesh(
    mesh: AbstractMesh,
    scene: Scene,
    texturePath: string
): void 
{
    if (!mesh) return;

    const mat = new StandardMaterial(`stdMat_${mesh.name}`, scene);
    const texture = new Texture(texturePath, scene);
    texture.hasAlpha = true; // active la transparence

    mat.diffuseTexture = texture;
    mat.useAlphaFromDiffuseTexture = true; 
    mat.emissiveColor = new Color3(1, 1, 1);
    mat.backFaceCulling = false;

    mesh.material = mat;
}

export function disposeMaterialWithTexture(
    material?: StandardMaterial
): void 
{
    if (!material) return;

    material.diffuseTexture?.dispose();
    material.dispose();
}


export function applyTextToMesh(
    mesh: AbstractMesh,
    scene: Scene,
    text: string,
    fontSize: number = 48,
    fontFamily: string = 'Arial',
    textColor: Color3 = Color3.White(),
    backgroundColor: Color3 = new Color3(0, 0, 0)
    ): void 
{
    const textureSize = 512;

    const dynamicTexture = new DynamicTexture(
        'textTexture_' + mesh.name,
        { width: textureSize, height: textureSize },
        scene,
        false
    );
    dynamicTexture.hasAlpha = true;

    const ctx = dynamicTexture.getContext();

    // Fond transparent
    ctx.fillStyle = `rgba(${backgroundColor.r * 255}, ${backgroundColor.g * 255}, ${backgroundColor.b * 255}, 0)`;
    ctx.fillRect(0, 0, textureSize, textureSize);

    // Texte
    const font = `${fontSize}px ${fontFamily}`;
    dynamicTexture.drawText(
        text,
        null,
        null,
        font,
        `rgba(${textColor.r * 255}, ${textColor.g * 255}, ${textColor.b * 255}, 1)`,
        'transparent',
        true,
        true
    );

    const material = new StandardMaterial('textMat_' + mesh.name, scene);
    material.diffuseTexture = dynamicTexture;
    material.emissiveColor = Color3.White();
    material.specularColor = Color3.Black();

    mesh.material = material;
}


/**************************************************
 *                 SCOREBOARD                     *
 **************************************************/

export function moveSponge(
    mesh: AbstractMesh,
    scene: Scene
) : void 
{
    const startPos = mesh.position.clone();

    const midPos = new Vector3(
        startPos.x - 8,
        startPos.y - 5,
        startPos.z
    );

    const animation = new Animation(
        "spongeMove",
        "position",
        60,
        Animation.ANIMATIONTYPE_VECTOR3,
        Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    animation.setKeys([
        { frame: 0, value: startPos },
        { frame: 20, value: midPos },
        { frame: 40, value: startPos }
    ]);

    const easingFunction = new CubicEase();
    easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
    animation.setEasingFunction(easingFunction);

    mesh.animations = [];
    mesh.animations.push(animation);

    scene.beginAnimation(mesh, 0, 40, false);
}
