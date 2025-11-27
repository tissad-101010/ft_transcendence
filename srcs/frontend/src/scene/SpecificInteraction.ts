import { PointerInfo, AbstractMesh } from '@babylonjs/core';

export interface SpecificInteraction {
    handlePointer(pointerInfo: PointerInfo, isClick: boolean, mesh: AbstractMesh): void;
    dispose(): void;
    show?(): void;
    hide?(): void;
}

