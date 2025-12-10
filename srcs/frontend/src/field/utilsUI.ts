
import {
    AdvancedDynamicTexture,
    StackPanel,
    TextBlock,
    Control,
    Rectangle,
    Button,
    Image,
    InputText
} from "@babylonjs/gui";


interface SectionTitleOptions {
    parent: StackPanel | Rectangle;
    text: string;
    height?: string;
    fontSize?: number;
    color?: string;
    background?: string;
    textHorizontalAlignment?: number;
    textVerticalAlignment?: number;
    paddingLeft?: string;
    iconName?: "mail" | "security" | "user"; // ajouter toutes les icônes possibles
}

interface MsgInfoOptions {
    parent: StackPanel | Rectangle;
    text?: string;
    height?: string;
    fontSize?: number;
    color?: string;
    background?: string;
    textHorizontalAlignment?: number;
    textVerticalAlignment?: number;
    paddingLeft?: string;
    paddingTop?: string;
}

interface ButtonOptions {
    id: string;
    txt: string;
    width?: string;
    height?: string;
    color?: string;
    fontSize?: number;
    paddingLeft?: string;
    paddingTop?: string;
    background?: string;
    cornerRadius?: number;
    thickness?: number;
    onClick?: (button: Button) => void;
    textHorizontalAlignment?: number;
    textVerticalAlignment?: number;
}

export function createButton(options: ButtonOptions): Button {

    const button = Button.CreateSimpleButton(options.id, options.txt);

    // Styles du bouton
    button.width = options.width ?? "100%";
    button.height = options.height ?? "50px";
    button.color = options.color ?? "white";
    button.fontSize = options.fontSize ?? 24;
    button.background = options.background ?? "gray";
    button.cornerRadius = options.cornerRadius ?? 0;
    button.thickness = options.thickness ?? 0;

    // Styles du texte interne
    if (button.textBlock) {
        if (options.paddingLeft) button.textBlock.paddingLeft = options.paddingLeft;
        if (options.paddingTop) button.textBlock.paddingTop = options.paddingTop;
        button.textBlock.textHorizontalAlignment = options.textHorizontalAlignment ?? Control.HORIZONTAL_ALIGNMENT_CENTER;
        button.textBlock.textVerticalAlignment = options.textVerticalAlignment ?? Control.VERTICAL_ALIGNMENT_CENTER;
        button.textBlock.color = options.color ?? "white";
        button.textBlock.fontSize = options.fontSize ?? 24;
    }

    // Event click
    if (options.onClick) {
        button.onPointerUpObservable.add(() => {
            options.onClick?.(button);
        });
    }

    return button;
}



export function create2faButton(options: {
    id: string,
    stateVar: () => boolean,            // getter de l'état
    setStateVar: (val: boolean) => void, // setter de l'état
    activeText: string,
    inactiveText: string,
    activeColor: string,
    inactiveColor: string,
    fontSize?: number,
    width?: string,
    height?: string,
    cornerRadius?: number,
    onActivate?: () => void
    onDeactivate?: () => void,
}) {
    const btn = Button.CreateSimpleButton(options.id, "");
    btn.height = options.height ?? "50px";
    btn.width = options.width ?? "70%";
    btn.color = "white";
    btn.fontSize = options.fontSize ?? 20;
    btn.cornerRadius = options.cornerRadius ?? 10;

    // Fonction pour mettre à jour le texte et la couleur
    const updateButton = () => {
        if (options.stateVar()) {
            btn.textBlock!.text = options.inactiveText;
            btn.background = options.inactiveColor;
        } else {
            btn.textBlock!.text = options.activeText;
            btn.background = options.activeColor;
        }
    };

    updateButton(); // initialisation

    btn.onPointerUpObservable.add(() => {
        if (options.stateVar()) {
            options.setStateVar(false);
            updateButton();
            if (options.onDeactivate) options.onDeactivate();
        } else {
            if (options.onActivate) options.onActivate();
        }
    });

    return btn;
}


export function createInputFieldPwd(placeholderText: string, panelPwd : StackPanel) {
        const panelRec = new Rectangle();
        panelRec.width = "40%";
        panelRec.thickness = 0;
        panelRec.height = "60px";
        panelPwd.addControl(panelRec);

        const input = new InputText();
        input.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

        input.paddingTop = "5px";
        input.width = "100%";
        input.height = "100%";
        input.color = "red";
        input.fontSize = 26;
        input.thickness = 0;
        input.background = "white";
        input.focusedBackground = "white";   // garde fond blanc au clic
        input.placeholderText = placeholderText;
        input.placeholderColor = "gray";

        let realValue = "";
        input.onTextChangedObservable.add(() => {
            const lastChar = input.text.slice(realValue.length);
            if (input.text.length > realValue.length) {
                realValue += lastChar;
            }
            else {
                realValue = realValue.slice(0, input.text.length);
            }
            input.text = "•".repeat(realValue.length);
        });
        panelRec.addControl(input);
        return () => realValue;
  }


  export function createInputField2fa(parent: StackPanel): InputText {
    const input = new InputText();
    input.width = "300px";
    input.height = "100%";
    input.color = "red";
    input.fontSize = 20;
    input.thickness = 0;
    input.background = "white";
    input.focusedBackground = "white";
    input.placeholderText = "code de verification";
    input.placeholderColor = "gray";
    input.paddingLeft = 100;
    input.onTextChangedObservable.add(() => {
        if (input.text.length > 6) {
            input.text = input.text.slice(0, 6);
        }
    });
    parent.addControl(input);
    return input;
}

export function createSectionTitle(options: SectionTitleOptions): Rectangle {
    // rectangle parent
    const rect = new Rectangle();
    rect.height = options.height ?? "50px";
    rect.thickness = 0;
    rect.background = options.background ?? "transparent";

    // ajouter au parent
    options.parent.addControl(rect);

    // texte interne
    const txt = new TextBlock();
    txt.text = options.text;
    txt.height = options.height ?? "50px";
    txt.fontSize = options.fontSize ?? 20;
    txt.color = options.color ?? "black";
    txt.textHorizontalAlignment = options.textHorizontalAlignment ?? Control.HORIZONTAL_ALIGNMENT_LEFT;
    txt.textVerticalAlignment = options.textVerticalAlignment ?? Control.VERTICAL_ALIGNMENT_CENTER;
    if (options.paddingLeft) txt.paddingLeft = options.paddingLeft;
    rect.addControl(txt);

    // Icône
    if (options.iconName) {
        const iconMap: Record<string, string> = {
            user: "/icon/user.png",
            mail: "/icon/mail.png",
            security: "/icon/security.png"
        };
        const imgPath = iconMap[options.iconName];
        if (imgPath) {
            const img = new Image("icon", imgPath);
            img.width = "25px";
            img.height = "25px";
            img.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
            img.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;

            const rectImg = new Rectangle();
            rectImg.height = options.height ?? "50px";
            rectImg.width = "75px";
            rectImg.thickness = 0;
            rectImg.paddingLeft = 40;
            rectImg.addControl(img);
            rect.addControl(rectImg);
        }
    }
    return rect;
}

export function createMsgInfo(options: MsgInfoOptions): { rect: Rectangle, textBlock: TextBlock } {
    const rect = new Rectangle();
    rect.height = options.height ?? "50px";
    rect.thickness = 0;
    rect.background = options.background ?? "transparent";
    options.parent.addControl(rect);

    const txt = new TextBlock();
    txt.text = options.text ?? "";
    txt.height = options.height ?? "50px";
    txt.fontSize = options.fontSize ?? 18;
    txt.color = options.color ?? "black";
    txt.textHorizontalAlignment = options.textHorizontalAlignment ?? Control.HORIZONTAL_ALIGNMENT_CENTER;
    txt.textVerticalAlignment = options.textVerticalAlignment ?? Control.VERTICAL_ALIGNMENT_CENTER;

    if (options.paddingLeft) txt.paddingLeft = options.paddingLeft;
    if (options.paddingTop) txt.paddingTop = options.paddingTop;

    rect.addControl(txt);

    return { rect, textBlock: txt };
}
