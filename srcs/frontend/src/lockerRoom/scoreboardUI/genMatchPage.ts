import 
{
  StackPanel,
  TextBlock,
  Grid
} from "@babylonjs/gui";

import { UIData } from "../utils.ts";

export function genMatchPage(grid : Grid) : StackPanel
{
    const page = new StackPanel();
    page.isVertical = true;
    page.width = "90%";
    grid.addControl(page, 0, 0);

    const title = new TextBlock();
    title.text = "Match";
    title.color = UIData.title.color;
    title.fontSize = UIData.title.fontSize;
    title.fontFamily = UIData.title.fontFamily;
    title.width = "200px";
    title.height = "80px";

    page.addControl(title);

    return (page);
}