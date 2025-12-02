import 
{
  StackPanel,
  Button,
  TextBlock,
  InputText,
  Control,
  Grid,
  Rectangle,
  Ellipse,
  ScrollViewer
} from "@babylonjs/gui";

import { UIData } from "./utils.ts";

import { Friend } from "../../friends/Friend.ts";
import { UserX } from "../../UserX.ts";

import { myClearControls } from "../../utils.ts";


function genFriendList(
    env: UIData,
    userX: UserX,
    container: {scrollViewer: ScrollViewer},
    lists: StackPanel
) : ScrollViewer
{

    const blockFriend = new ScrollViewer();
    blockFriend.width = "400px";
    blockFriend.height = "200px";
    blockFriend.background = "transparent";
    blockFriend.barColor = env.text.color;
    blockFriend.thickness = 1;
    blockFriend.horizontalBarVisible = false;

    const panel = new StackPanel();
    panel.width = "100%";
    panel.isVertical = true;
    panel.spacing = 5;
    blockFriend.addControl(panel);

    const text = new TextBlock();
    text.text = "Amis";
    text.color = env.text.color;
    text.width = "100%";
    text.height = "30px";
    text.fontSize = env.text.fontSize - 3;
    text.fontFamily = env.text.fontFamily;
    text.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    panel.addControl(text);    

    const friends = userX.getFriends.filter((f : Friend) => f.getOnline === true);

    for (let i = 0; i < friends.length; i++)
    {
        const test = new TextBlock();
        test.text = friends[i].getUsername;
        test.height = "30px";
        test.width = "100%";
        test.fontSize = env.text.fontSize - 3;
        test.fontFamily = env.text.fontFamily;
        test.color = env.text.color;
        panel.addControl(test);

        test.onPointerClickObservable.add(() => {
            if (!userX.getTournament?.addParticipant({login: test.text, alias: test.text, ready: true, id: friends[i].getId}))
                genWaitingList(env, userX, container, lists);
        })

        test.onPointerEnterObservable.add(() => {
            test.color = env.button.hoveredBackground;
        });

        test.onPointerOutObservable.add(() => {
            test.color = env.text.color;
        })
    }
    return (blockFriend);
}


function genWaitingList(
    env: UIData,
    userX: UserX,
    container: {scrollViewer: ScrollViewer},
    lists: StackPanel
) : void
{
    if (!userX.getTournament)
        return ;
    if (!container.scrollViewer)
    {
        container.scrollViewer = new ScrollViewer();
        container.scrollViewer.width = "400px";
        container.scrollViewer.height = "200px";
        container.scrollViewer.background = "transparent";
        container.scrollViewer.barColor = env.text.color;
        container.scrollViewer.thickness = 1;
        container.scrollViewer.horizontalBarVisible = false;
        lists.addControl(container.scrollViewer);
    }
    else
        container.scrollViewer.clearControls();

    const panel = new StackPanel();
    panel.width = "100%";
    panel.isVertical = true;
    panel.spacing = 5;
    container.scrollViewer.addControl(panel);

    const text = new TextBlock();
    text.text = "Invites (" + userX.getTournament.getParticipants.length + ")";
    text.color = env.text.color;
    text.width = "100%";
    text.height = "50px";
    text.fontSize = env.text.fontSize - 3;
    text.fontFamily = env.text.fontFamily;
    text.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    panel.addControl(text);    

    for (let i = 0; i < userX.getTournament.getParticipants.length; i++)
    {
        const row = new StackPanel();
        row.isVertical = false;
        row.height = "30px";
        row.width = "100%";
        row.spacing = 5;
        panel.addControl(row);

        const test = new TextBlock();
        test.text = userX.getTournament.getParticipants[i].login;
        test.height = "30px";
        test.width = "300px";
        test.paddingLeft = "20px";
        test.fontSize = env.text.fontSize - 3;
        test.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        test.fontFamily = env.text.fontFamily;
        test.color = env.text.color;
        row.addControl(test);

        test.onPointerClickObservable.add(() => {
            if (!userX.getTournament)
                return ;
            if (userX.getTournament.getParticipants[i].login !== userX.getUser.login)
            userX.getTournament?.removeParticipant(userX.getTournament.getParticipants[i]);
            genWaitingList(env, userX, container, lists);
        })

        test.onPointerEnterObservable.add(() => {
            test.color = env.button.hoveredBackground;
        });

        test.onPointerOutObservable.add(() => {
            test.color = env.text.color;
        })

        const circle = new Ellipse();
        circle.width = "10px";
        circle.height = "10px";
        circle.color = "black";
        circle.paddingRight = "20px";
        circle.thickness = 1;
        if (userX.getTournament.getParticipants[i].ready)
            circle.background = "green";
        else
            circle.background = "red";
        row.addControl(circle);
    }
}

function genRowLogin(
    env: UIData,
    userX: UserX,
    container: {scrollViewer: ScrollViewer},
    lists: StackPanel
) : StackPanel
{
    const row = new StackPanel();
    row.height = "30px";
    row.isVertical = false;
    row.spacing = 10;
    row.paddingLeft = "5px";
    row.paddingRight = "5px";

    const login = new InputText();
    login.placeholderText = "Login";
    login.width = "100px";
    login.height = row.height + "px";
    login.color = env.text.color;
    login.background = env.inputText.background;
    login.focusedBackground = env.inputText.focusedBackground;
    login.fontSize = env.inputText.fontSize;
    login.thickness = env.inputText.thickness;
    login.fontFamily = env.inputText.fontFamily;
    row.addControl(login);

    login.onTextChangedObservable.add(() => {
        login.background = env.inputText.background;
        if (error)
        {
            error.dispose();
            error = null;
        }
    });

    const button = new Button("loginButton");
    button.width = "70px";
    button.height = "50px";
    button.background = env.inputText.background;
    button.color = env.text.color;
    button.thickness = 1;
    row.addControl(button);

    const textButton = new TextBlock();
    textButton.text = "OK";
    textButton.color = env.text.color;
    textButton.fontFamily = env.text.fontFamily;
    textButton.fontSize = env.text.fontSize;
    button.addControl(textButton);

    let error : TextBlock | null = null;
    button.onPointerClickObservable.add(() => {
        if (login.text === "")
        {
            error = new TextBlock();
            error.text = "Le joueur n'a pas ete trouve";
            error.color = "red";
            error.width = "400px";
            error.height = "50px";
            error.fontSize = env.text.fontSize;
            error.fontFamily = env.text.fontFamily;
            row.addControl(error);
            return ;
        }
        if (error)
        {
            error.dispose();
            error = null;
        }
        /* RECHERCHE DANS LA BDD SI L'UTILISATEUR EXISTE */
        const participant = {
            login: login.text,
            alias: login.text,
            ready: false
        };
        login.text = "";
        if (!userX.getTournament?.addParticipant(participant))
            genWaitingList(env, userX, container, lists);
    })
    return (row);
}

export function genInvitationPage(
    env: UIData,
    userX: UserX
) : StackPanel
{
    const container = {
        scrollViewer : null
    }

    const page = new StackPanel();
    page.isVertical = true;
    page.paddingTop = "70px";
    page.width = "90%";

    const title = new TextBlock();
    title.text = "Participants";
    title.color = env.title.color;
    title.fontSize = env.title.fontSize;
    title.fontFamily = env.title.fontFamily;
    title.width = "200px";
    title.height = "80px";
    
    page.addControl(title);
    const listsContainer = new StackPanel();
    listsContainer.isVertical = false;
    listsContainer.height = "400px";
    listsContainer.spacing = 10;
    listsContainer.paddingLeft = "10px";
    listsContainer.paddingRight = "10px";

    page.addControl(genRowLogin(env, userX, container, listsContainer));
    page.addControl(listsContainer);
    listsContainer.addControl(genFriendList(env, userX, container, listsContainer));
    genWaitingList(env, userX, container, listsContainer);

    return (page);
}