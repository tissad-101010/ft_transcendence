import 
{
  StackPanel,
  Button,
  TextBlock,
  InputText,
  Control,
  Grid,
  Rectangle,
  Ellipse
} from "@babylonjs/gui";

import { UIData } from "./utils.ts";

import { UserX } from "../UserX.ts";
import { myClearControls } from "../../utils.ts";


function genFriendList(env: UIData, userX: UserX, refreshAllLists: () => void) : Rectangle
{
    const blockFriend = new Rectangle();
    blockFriend.width = "400px";
    blockFriend.height = "200px";
    blockFriend.color = env.text.color;
    blockFriend.thickness = 1;

    const rowFriend = new StackPanel();
    rowFriend.height = "200px";
    rowFriend.isVertical = false;
    rowFriend.paddingLeft = "10px";
    rowFriend.paddingRight = "10px";
    rowFriend.spacing = 2;
    rowFriend.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    blockFriend.addControl(rowFriend);

    const text = new TextBlock();
    text.text = "Amis";
    text.color = env.text.color;
    text.width = "75px";
    text.height = "50px";
    text.fontSize = env.text.fontSize - 3;
    text.fontFamily = env.text.fontFamily;
    text.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    rowFriend.addControl(text);    

    let start = 0;
    const nbToDisplay = 4;
    let buttonLeft : Rectangle | null = null;
    let buttonRight : Rectangle | null = null;
    let block : StackPanel | null = null;

    const friends = userX.getFriends.filter((f) => f.getOnline === true);

    function refreshFriendList()
    {
        if (buttonLeft !== null)
            buttonLeft.dispose();
        if (start !== 0)
        {
            buttonLeft = new Rectangle();
            buttonLeft.width = "25px";
            buttonLeft.height = "25px";
            buttonLeft.background = env.inputText.background;
            buttonLeft.color = env.text.color;
            buttonLeft.textColor = env.text.color;
            buttonLeft.thickness = 1;
            rowFriend.addControl(buttonLeft);

            const labelLeft = new TextBlock();
            labelLeft.text = "<";
            labelLeft.color = env.text.color;
            labelLeft.fontFamily = env.text.fontFamily;
            buttonLeft.addControl(labelLeft);

            buttonLeft.onPointerClickObservable.add(() => {
                start -= nbToDisplay;
                refreshFriendList();
            });
        }

        if (block !== null)
            block.dispose();
        block = new StackPanel(); // CONTIENT LA LISTE DES LOGINS (CLIQUABLES)
        block.isVertical = true;
        block.width = "200px";
        block.spacing = 1;
        block.color = env.text.color;
        rowFriend.addControl(block);
            

        function displayFriend()
        {
            for (let i = start; i < start + nbToDisplay && i < friends.length; i++)
            {
                const test = new TextBlock();
                test.text = friends[i].getLogin;
                test.height = "40px";
                test.width = "200px";
                test.fontSize = env.text.fontSize - 3;
                test.fontFamily = env.text.fontFamily;
                test.color = env.text.color;
                block.addControl(test);

                test.onPointerClickObservable.add(() => {
                    userX.getTournament?.addParticipant({login: test.text, alias: test.text, ready: true, id: friends[i].getId});
                    refreshAllLists();
                })

                test.onPointerEnterObservable.add(() => {
                    test.color = env.button.hoveredBackground;
                });

                test.onPointerOutObservable.add(() => {
                    test.color = env.text.color;
                })
            }
        }

        displayFriend();

        if (buttonRight !== null)
            buttonRight.dispose();
        if (start + nbToDisplay < friends.length)
        {
            buttonRight = new Rectangle();
            buttonRight.width = "25px";
            buttonRight.height = "25px";
            buttonRight.background = env.inputText.background;
            buttonRight.color = env.text.color;
            buttonRight.thickness = 1;
            rowFriend.addControl(buttonRight);
            
            const labelRight = new TextBlock();
            labelRight.text = ">";
            labelRight.color = env.text.color;
            labelRight.fontFamily = env.text.fontFamily;
            buttonRight.addControl(labelRight);

            buttonRight.onPointerClickObservable.add(() => {
                start += nbToDisplay;
                refreshFriendList();
            })
        }
    }
    
    refreshFriendList();

    return (blockFriend);
}

function genWaitingList(env: UIData, userX: UserX, refreshAllLists: () => void) : Rectangle
{
    if (!userX.getTournament)
        return ;
    const blockWaiting = new Rectangle();
    blockWaiting.width = "400px";
    blockWaiting.height = "200px";
    blockWaiting.color = env.text.color;
    blockWaiting.thickness = 1;

    const rowWaiting = new StackPanel();
    rowWaiting.height = "200px";
    rowWaiting.paddingLeft = "10px";
    rowWaiting.paddingRight = "10px";
    rowWaiting.isVertical = false;
    rowWaiting.spacing = 2;
    rowWaiting.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    blockWaiting.addControl(rowWaiting);

    const text = new TextBlock();
    text.text = "Invite";
    text.color = env.text.color;
    text.width = "100px";
    text.height = "50px";
    text.fontSize = env.text.fontSize - 3;
    text.fontFamily = env.text.fontFamily;
    text.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    rowWaiting.addControl(text);

    let start = 0;
    const nbToDisplay = 4;
    let buttonLeft : Rectangle | null = null;
    let buttonRight : Rectangle | null = null;
    let block : StackPanel | null = null;

    function refreshFriendList()
    {
        if (!userX.getTournament)
            return ;
        if (buttonLeft !== null)
            buttonLeft.dispose();
        if (start !== 0)
        {
            buttonLeft = new Rectangle();
            buttonLeft.width = "25px";
            buttonLeft.height = "25px";
            buttonLeft.background = env.inputText.background;
            buttonLeft.color = env.text.color;
            buttonLeft.textColor = env.text.color;
            buttonLeft.thickness = 1;
            rowWaiting.addControl(buttonLeft);

            const labelLeft = new TextBlock();
            labelLeft.text = "<";
            labelLeft.color = env.text.color;
            labelLeft.fontFamily = env.text.fontFamily;
            buttonLeft.addControl(labelLeft);

            buttonLeft.onPointerClickObservable.add(() => {
                start -= nbToDisplay;
                refreshFriendList();
            });
        }

        if (block !== null)
            block.dispose();
        block = new StackPanel(); // CONTIENT LA LISTE DES LOGINS (CLIQUABLES)
        block.isVertical = true;
        block.width = "220px";
        block.spacing = 1;
        block.color = env.text.color;
        block.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        rowWaiting.addControl(block);
            

        function displayWaiting()
        {
            if (!userX.getTournament)
                return ;
            for (let i = start; i < start + nbToDisplay && i < userX.getTournament.getParticipants.length; i++)
            {
                const row = new StackPanel();
                row.isVertical = false;
                row.height = "30px";
                row.spacing = 5;
                block.addControl(row);

                const test = new TextBlock();
                test.text = userX.getTournament.getParticipants[i].login;
                test.height = "50px";
                test.width = "200px";
                test.fontSize = env.text.fontSize - 3;
                test.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
                test.fontFamily = env.text.fontFamily;
                test.color = env.text.color;
                row.addControl(test);

                test.onPointerClickObservable.add(() => {
                    if (!userX.getTournament)
                        return ;
                    if (userX.getTournament.getParticipants[i].login !== userX.getUser.login)
                    userX.getTournament?.removeParticipant(userX.getTournament.getParticipants[i]);
                    refreshAllLists();
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
                circle.thickness = 1;
                if (userX.getTournament.getParticipants[i].ready)
                    circle.background = "green";
                else
                    circle.background = "red";
                row.addControl(circle);

            }
        }

        displayWaiting();

        if (buttonRight !== null)
            buttonRight.dispose();
        if (start + nbToDisplay < userX.getTournament.getParticipants.length)
        {
            buttonRight = new Rectangle();
            buttonRight.width = "25px";
            buttonRight.height = "25px";
            buttonRight.background = env.inputText.background;
            buttonRight.color = env.text.color;
            buttonRight.thickness = 1;
            rowWaiting.addControl(buttonRight);
            
            const labelRight = new TextBlock();
            labelRight.text = ">";
            labelRight.color = env.text.color;
            labelRight.fontFamily = env.text.fontFamily;
            buttonRight.addControl(labelRight);

            buttonRight.onPointerClickObservable.add(() => {
                start += nbToDisplay;
                refreshFriendList();
            })
        }
    }
    
    refreshFriendList();

    return (blockWaiting);
}

function genRowLogin(env: UIData, userX: UserX, refreshAllLists: () => void) : StackPanel
{
    const row = new StackPanel();
    row.height = "50px";
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
        userX.getTournament?.addParticipant(participant);
        refreshAllLists();
    })
    return (row);
}

export function genInvitationPage(env: UIData, grid: Grid, userX: UserX) : StackPanel
{
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
    page.addControl(genRowLogin(env, userX, refreshAllLists));

    const listsContainer = new StackPanel();
    listsContainer.isVertical = false;
    listsContainer.height = "400px";
    listsContainer.spacing = 10;
    listsContainer.paddingLeft = "10px";
    listsContainer.paddingRight = "10px";
    page.addControl(listsContainer);

    function refreshAllLists()
    {
        myClearControls(listsContainer);
        if (userX.getFriends.length > 0)
            listsContainer.addControl(genFriendList(env, userX, refreshAllLists));
        if (userX.getTournament && userX.getTournament.getParticipants.length > 0)
            listsContainer.addControl(genWaitingList(env, userX, refreshAllLists));
    }

    refreshAllLists();
    
    return (page);
}