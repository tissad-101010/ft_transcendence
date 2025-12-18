import {
  Scene,
  Color3,
  PointLight,
  Mesh,
  StandardMaterial,
  PBRMaterial
} from '@babylonjs/core';

export class LightInteractor {
    /**************************************************
     *           PRIVATE ATTRIBUTES                   *
     **************************************************/
    private scene: Scene;
    private lights: PointLight[] = [];
    private meshesBulb: Mesh[] = [];
    /**************************************************
    *                 CONSTRUCTOR                     *
    **************************************************/
    constructor(scene: Scene)
    {
        this.scene = scene;
    }

    public turnOnLights()
    {
        if (this.meshesBulb && this.meshesBulb.length > 0){
            this.lights.forEach(light => {
                light.dispose();
            });
            this.lights = [];
            this.meshesBulb.forEach(mesh =>{
                if (mesh.material)
                {
                    if (mesh.material instanceof StandardMaterial)
                    {
                        mesh.material.emissiveColor = new Color3(0, 0, 0);
                        mesh.material.disableLighting = false;
                    }
                    else if (mesh.material instanceof PBRMaterial)
                        mesh.material.emissiveColor = Color3.Black();
                }
            });
            this.meshesBulb = [];
        }
        this.handleLocker();
        this.handlePool();
        this.handleStand();
    }

    public handlePool()
    {
        const mesh = this.scene.getMeshByName("bulb_pool");
        const light = new PointLight(
            "pointLight",
            mesh!.getAbsolutePosition(), // position de la lumière dans la scène
            this.scene
        );
        this.lights.push(light);
        if (mesh!.material instanceof StandardMaterial)
        {
            mesh!.material.emissiveColor = new Color3(1, 1, 1);
            mesh!.material.disableLighting = false;
        }
        else if (mesh!.material instanceof PBRMaterial)
            mesh!.material.emissiveColor = new Color3(1, 1, 1);

        const mesh2 = this.scene.getMeshByName("bulb_body_pool");
        this.meshesBulb.push((mesh as Mesh), (mesh2 as Mesh));
        if (mesh2!.material instanceof StandardMaterial)
        {
            mesh2!.material.emissiveColor = new Color3(1, 1, 1);
            mesh2!.material.disableLighting = false;
        }
        else if (mesh2!.material instanceof PBRMaterial)
            mesh2!.material.emissiveColor = new Color3(1, 1, 1);

        // Couleur et intensité
        light.diffuse = new Color3(1, 1, 1);   // teinte jaune clair
        light.specular = new Color3(1, 1, 1);  // reflets similaires
        light.intensity = 600;                            // plus tu montes, plus c’est fort
        light.range = 800;
    }

    public handleLocker()
    {
        const mesh = this.scene.getMeshByName("bulb_locker");
        const light = new PointLight(
            "pointLight",
            mesh!.getAbsolutePosition(), // position de la lumière dans la scène
            this.scene
        );
        this.lights.push(light);
        if (mesh!.material instanceof StandardMaterial)
        {
            mesh!.material.emissiveColor = new Color3(1, 1, 1);
            mesh!.material.disableLighting = false;
        }
        else if (mesh!.material instanceof PBRMaterial)
            mesh!.material.emissiveColor = new Color3(1, 1, 1);
        const mesh2 = this.scene.getMeshByName("bulb_body_locker");
        if (mesh2!.material instanceof StandardMaterial)
        {
            mesh2!.material.emissiveColor = new Color3(1, 1, 1);
            mesh2!.material.disableLighting = false;
        }
        else if (mesh2!.material instanceof PBRMaterial)
            mesh2!.material.emissiveColor = new Color3(1, 1, 1);

        this.meshesBulb.push((mesh as Mesh), (mesh2 as Mesh));
        // Couleur et intensité
        light.diffuse = new Color3(1, 1, 1);   // teinte jaune clair
        light.specular = new Color3(1, 1, 1);  // reflets similaires
        light.intensity = 600;                            // plus tu montes, plus c’est fort
        light.range = 800;
    }


    public handleStand() {
        const mesh = this.scene.getMeshByName("bulb_standDirection0");
        const mesh1 = this.scene.getMeshByName("bulb_standDirection1");
        const light = new PointLight(
            "pointLight",
            mesh!.getAbsolutePosition(), // position de la lumière dans la scène
            this.scene
        );
        this.lights.push(light);

        const light1 = new PointLight(
            "pointLight",
            mesh1!.getAbsolutePosition(), // position de la lumière dans la scène
            this.scene
        );
        this.lights.push(light1);
        this.meshesBulb.push((mesh as Mesh), (mesh1 as Mesh));
        if (mesh!.material instanceof StandardMaterial)
        {
            mesh!.material.emissiveColor = new Color3(1, 1, 1);
            mesh!.material.disableLighting = false;
        }
        else if (mesh!.material instanceof PBRMaterial)
            mesh!.material.emissiveColor = new Color3(1, 1, 1);
        // Couleur et intensité
        light.diffuse = new Color3(1, 1, 1);   // teinte jaune clair
        light.specular = new Color3(1, 1, 1);  // reflets similaires
        light.intensity = 5000;                            // plus tu montes, plus c’est fort
        light.range = 2000;

        if (mesh1!.material instanceof StandardMaterial)
        {
            mesh1!.material.emissiveColor = new Color3(1, 1, 1);
            mesh1!.material.disableLighting = false;
        }
        else if (mesh1!.material instanceof PBRMaterial)
            mesh1!.material.emissiveColor = new Color3(1, 1, 1);
        // Couleur et intensité
        light1.diffuse = new Color3(1, 1, 1);   // teinte jaune clair
        light1.specular = new Color3(1, 1, 1);  // reflets similaires
        light1.intensity = 5000;                            // plus tu montes, plus c’est fort
        light1.range = 2000;
    }

    public turnOffLights(){
        this.lights.forEach(light => {
            light.dispose();
        });
        this.lights = [];
        this.meshesBulb.forEach(mesh =>{
            if (mesh.material){
                if (mesh!.material instanceof StandardMaterial)
                {
                    mesh!.material.emissiveColor = new Color3(1, 1, 1);
                    mesh!.material.disableLighting = false;
                }
                else if (mesh!.material instanceof PBRMaterial)
                    mesh!.material.emissiveColor = new Color3(1, 1, 1);
            }
        });
        this.meshesBulb = [];
        const bulbField = ["bulb_field0", "bulb_field1", "bulb_field2", "bulb_field3"];
        bulbField.forEach((name, i) => {
            const mesh = this.scene.getMeshByName(name);
            if (!mesh) {
                console.warn(`⚠️ Mesh ${name} introuvable`);
                return;
            }
            const light = new PointLight(`bulbLight_${i + 1}`, mesh.getAbsolutePosition(), this.scene);
            this.lights.push(light);
            this.meshesBulb.push((mesh as Mesh));
            if (mesh!.material instanceof StandardMaterial)
            {
                mesh!.material.emissiveColor = new Color3(1, 1, 1);
                mesh!.material.disableLighting = false;
            }
            else if (mesh!.material instanceof PBRMaterial)
                mesh!.material.emissiveColor = new Color3(1, 1, 1);
            light.diffuse = new Color3(1, 1, 1);
            light.specular = new Color3(1, 1, 1);
            light.intensity = 600;
            light.range = 1000;
        });
    }

    /**************************************************
    *                     PRIVATE                     *
    **************************************************/
}