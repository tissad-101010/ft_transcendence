import 
{
  StackPanel,
  Rectangle,
  TextBlock,
  InputText,
  Control,
  AdvancedDynamicTexture,
  Button,
  Grid
} from "@babylonjs/gui";

import { UIData } from "../utils.ts";

import { MatchRules } from "../../Match.ts";

export interface DataGraph
{
    container: {
        width: string,
        height: string,
        thickness: number,
        color: string
    },
    text: {
        color: string,
        fontSize: number,
        fontFamily: string
    },
    inputText: {
        fontSize: number,
        fontFamily: string,
        color: string,
        background: string,
        focusedBackground: string,
        thickness: number
    },
    button: {
        color: string,
        background: string,
        clickedBackground: string,
        hoveredBackground: string,
        thickness: number
    }
}

export interface DataMatchForm
{
    speed: string,
    timeBefore: string,
    score: string,
    mode: number,
    login: string
}

export interface DataMatchBlock
{
    data: MatchRules,
    graph: DataGraph,
    controlButtons: Button[],
    currPage: string,
    mode: number,
    login: string
}

function genRowSpeed(env: DataMatchBlock) : StackPanel
{
    const row = new StackPanel();
    row.isVertical = false;
    row.height = "50px";
    row.paddingLeft = "5px";
    row.paddingRight = "5px";
    row.spacing = 5;

    const speed = new TextBlock();
    speed.text = "Vitesse";
    speed.width = "450px";
    speed.color = env.graph.text.color;
    speed.fontSize = env.graph.text.fontSize;
    speed.fontFamily = env.graph.text.fontFamily;
    speed.height = row.height + "px";
    speed.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    speed.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    row.addControl(speed);

    function createButtonSpeed(label: string) 
    {
        const button = new Rectangle();
        button.height = "40px";
        button.width = "40px";
        button.thickness = env.graph.button.thickness;
        button.color = env.graph.text.color;
        if (env.data.speed === label)
            button.background = env.graph.button.clickedBackground;
        else
            button.background = env.graph.button.background;

        const text = new TextBlock();
        text.text = label;
        text.color = env.graph.text.color;
        text.fontSize = env.graph.text.fontSize;
        text.fontFamily = env.graph.text.fontFamily;
        button.addControl(text);

        button.onPointerClickObservable.add(() => {
            env.controlButtons.forEach((b) => {
                b.background = env.graph.button.background;
            })
            button.background = env.graph.button.clickedBackground;
            env.data.speed = text.text;
        });

        button.onPointerEnterObservable.add(() => {
            button.background = env.graph.button.hoveredBackground;
        });

        button.onPointerOutObservable.add(() => {
            if (env.data.speed === text.text)
                button.background = env.graph.button.clickedBackground;
            else
                button.background = env.graph.button.background;
        })

        return (button);
    };

    const labels = ["1", "2", "3"];
    labels.forEach((l) => {
        const b = createButtonSpeed(l);
        env.controlButtons.push(b);
        row.addControl(b);
    });

    return (row);
}

function genRowScore(env: DataMatchBlock) : StackPanel
{
    const row = new StackPanel();
    row.isVertical = false;
    row.spacing = 10;
    row.height = "50px";
    row.paddingLeft = "5px";
    row.paddingRight = "5px";

    const text = new TextBlock();
    text.text = "Score a atteindre";
    text.width = "450px";
    text.height = row.height + "px";
    text.color = env.graph.text.color;
    text.fontSize = env.graph.text.fontSize;
    text.fontFamily = env.graph.text.fontFamily;
    text.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    text.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    row.addControl(text);

    const score = new InputText();
    score.width = "50px";
    score.height = "35px";
    score.maxLength = 2;
    score.fontSize = env.graph.inputText.fontSize;
    score.fontFamily = env.graph.inputText.fontFamily;
    score.background = env.graph.inputText.background;
    score.color = env.graph.inputText.color;
    score.focusedBackground = env.graph.inputText.focusedBackground;
    score.thickness = env.graph.inputText.thickness;
    if (env.data.score != "")
        score.text = env.data.score;
    row.addControl(score);

    let error : TextBlock | null = null;
    let previousText : string = "";

    score.onBeforeKeyAddObservable.add((key: string) => {
        previousText = score.text;
    });

    score.onTextChangedObservable.add(() => {
        const cleaned = score.text.replace(/[^0-9]/g, "");
        if (cleaned !== score.text || score.text.length >= 3)
        {
            score.text = previousText;
            return ;
        }

        const value = parseInt(score.text, 10);
        if (error === null && (isNaN(value) || value <= 0 || value >= 100))
        {
            error = new TextBlock();
            error.color = "red";
            error.fontSize = env.graph.text.fontSize;
            error.width = "100px";
            error.fontFamily = env.graph.text.fontFamily;
            error.height = "20px";
            error.text = "[1-99]";
            row.addControl(error);
        }
        else if ((value >= 1 && value <= 9) && error !== null)
        {
            row.removeControl(error);
            error = null;
        }
        env.data.score = score.text;
    });

    return (row);
}

function genRowTime(env: DataMatchBlock) : StackPanel
{
    const row = new StackPanel();
    row.height = "50px";
    row.isVertical = false;
    row.spacing = 10;
    row.paddingLeft = "5px";
    row.paddingRight = "5px";

    const text = new TextBlock();
    text.text = "Temps avant engagement (sec)";
    text.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    text.width = "450px";
    text.height = row.height + "px";
    text.color = env.graph.text.color;
    text.fontSize = env.graph.text.fontSize;
    text.fontFamily = env.graph.text.fontFamily;
    text.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    text.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    row.addControl(text);

    const time = new InputText();
    time.width = "40px";
    time.height = "35px";
    time.maxLength = 2;
    time.fontSize = env.graph.inputText.fontSize;
    time.fontFamily = env.graph.inputText.fontFamily;
    time.background = env.graph.inputText.background;
    time.color = env.graph.inputText.color;
    time.focusedBackground = env.graph.inputText.focusedBackground;
    time.thickness = env.graph.inputText.thickness;
    if (env.data.timeBefore !== "")
        time.text = env.data.timeBefore;
    row.addControl(time);

    let error : TextBlock | null = null;

    let previousText : string = "";
    time.onBeforeKeyAddObservable.add((key: string) => {
        previousText = time.text;
    });
    time.onTextChangedObservable.add(() => {
        const cleaned = time.text.replace(/[^0-9]/g, "");
        if (cleaned !== time.text || time.text.length >= 2)
        {
            time.text = previousText;
            return ;
        }

        const value = parseInt(time.text, 10);
        if (error === null && (isNaN(value) || value < 0 || value >= 10))
        {
            error = new TextBlock();
            error.color = "red";
            error.fontSize = env.graph.text.fontSize;
            error.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
            error.width = "100px";
            error.fontFamily = env.graph.text.fontFamily;
            error.height = "20px";
            error.text = "[0-9]";
            row.addControl(error);
        }
        else if ((value >= 0 && value <= 9) && error !== null)
        {
            row.removeControl(error);
            error = null;
        }
        env.data.timeBefore = time.text;
    });
    return (row);
}

function genRowMode(env: DataMatchBlock) : StackPanel
{
    const row = new StackPanel();
    row.height = "50px";
    row.isVertical = false;
    row.spacing = 10;
    row.paddingLeft = "5px";
    row.paddingRight = "5px";

    const text = new TextBlock();
    text.text = "Adversaire : ";
    text.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    text.width = "450px";
    text.height = row.height + "px";
    text.color = env.graph.text.color;
    text.fontSize = env.graph.text.fontSize;
    text.fontFamily = env.graph.text.fontFamily;
    text.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    text.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    row.addControl(text);

    const buttons : Button = [];
    let inputLogin : null | InputText = null;

    function createButton(label: string) 
    {
        const button = new Rectangle();
        button.height = "30px";
        button.width = "100px";
        button.thickness = env.graph.button.thickness;
        button.color = env.graph.text.color;
        button.background = env.graph.button.background;

        const text = new TextBlock();
        text.text = label;
        text.color = env.graph.text.color;
        text.fontFamily = env.graph.inputText.fontFamily;
        button.addControl(text);


        button.onPointerClickObservable.add(() => {
            buttons.forEach((b : Button) => {
                b.background = env.graph.button.background;
            })
            button.background = env.graph.button.clickedBackground;
            if (label === "Local")
            {
                if (env.mode !== 0)
                {
                    env.mode = 0;
                    if (inputLogin !== null)
                    {
                        row.removeControl(inputLogin);
                        inputLogin.dispose();
                        inputLogin = null;
                    }
                }
            }
            else if (label === "En ligne")
            {
                if (env.mode !== 1)
                {
                    env.mode = 1;
                    inputLogin = new InputText();
                    inputLogin.width = "100px";
                    inputLogin.height = "30px";
                    inputLogin.fontSize = env.graph.inputText.fontSize;
                    inputLogin.fontFamily = env.graph.inputText.fontFamily;
                    inputLogin.background = env.graph.inputText.background;
                    inputLogin.color = env.graph.inputText.color;
                    inputLogin.focusedBackground = env.graph.inputText.focusedBackground;
                    inputLogin.thickness = env.graph.inputText.thickness;
                    row.addControl(inputLogin);
    
                    inputLogin.onTextChangedObservable.add(() => {
                        env.login = inputLogin.text;
                    });                
                }
            }
        });

        button.onPointerEnterObservable.add(() => {
            button.background = env.graph.button.hoveredBackground;
        });

        button.onPointerOutObservable.add(() => {
            if ((env.mode === 0 && label === "Local") ||
                    (env.mode === 1 && label === "En ligne"))
                button.background = env.graph.button.clickedBackground;
            else
                button.background = env.graph.button.background;
        })
        return (button);
    };

    const labels = ["Local", "En ligne"];
    labels.forEach((l) => {
        const b = createButton(l);
        buttons.push(b);
        row.addControl(b);
    });
    return (row);
}

export function genRulesMatchBlock(env: DataMatchBlock, selectMode: boolean) : Rectangle
{
    const container = new Rectangle();
    container.paddingTop = "50px";
    container.width =  env.graph.container.width;
    container.height = env.graph.container.height;
    container.thickness = env.graph.container.thickness;
    container.color = env.graph.container.color;

    const panel = new StackPanel();
    panel.isVertical = true;
    panel.width = "100%";

    container.addControl(panel);
    panel.addControl(genRowSpeed(env));
    panel.addControl(genRowScore(env));
    panel.addControl(genRowTime(env));
    if (selectMode)
        panel.addControl(genRowMode(env));
    return (container);
}
