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

import { UIData } from "../utils.ts";

import { Friend } from "../../friends/Friend.ts";
import { UserX } from "../../UserX.ts";

function genFriendList(
    userX: UserX,
    container: {scrollViewer: ScrollViewer | null},
    lists: StackPanel
) : ScrollViewer
{

    const blockFriend = new ScrollViewer();
    blockFriend.width = "400px";
    blockFriend.height = "200px";
    blockFriend.background = "transparent";
    blockFriend.barColor = UIData.text.color;
    blockFriend.thickness = 1;

    const panel = new StackPanel();
    panel.width = "100%";
    panel.isVertical = true;
    panel.spacing = 5;
    blockFriend.addControl(panel);

    const text = new TextBlock();
    text.text = "Amis";
    text.color = UIData.text.color;
    text.width = "100%";
    text.height = "30px";
    text.fontSize = UIData.text.fontSize - 3;
    text.fontFamily = UIData.text.fontFamily;
    text.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    panel.addControl(text);    

    const friends = userX.getFriends.filter((f : Friend) => f.getOnline === true);

    for (let i = 0; i < friends.length; i++)
    {
        const test = new TextBlock();
        test.text = friends[i].getUsername;
        test.height = "30px";
        test.width = "100%";
        test.fontSize = UIData.text.fontSize - 3;
        test.fontFamily = UIData.text.fontFamily;
        test.color = UIData.text.color;
        panel.addControl(test);

        test.onPointerClickObservable.add(() => {
            const friendId = friends[i].getId;
            if (friendId === undefined || friendId === null) {
                console.error(`Friend ${test.text} n'a pas d'ID valide`);
                return;
            }
            if (!userX.getTournament?.addParticipant({login: test.text, alias: test.text, ready: true, id: friendId, eliminate: false}))
                genWaitingList(userX, container, lists);
        })

        test.onPointerEnterObservable.add(() => {
            test.color = UIData.button.hoveredBackground;
        });

        test.onPointerOutObservable.add(() => {
            test.color = UIData.text.color;
        })
    }
    return (blockFriend);
}


function genWaitingList(
    userX: UserX,
    container: {scrollViewer: ScrollViewer | null},
    lists: StackPanel
) : void
{
    if (!userX.getTournament)
        return ;
    
    // Vérification que l'utilisateur connecté est dans la liste
    const currentUser = userX.getUser;
    if (currentUser) {
        const userInList = userX.getTournament.getParticipants.find((p: any) => p.login === currentUser.username);
        if (!userInList) {
            // Ajouter l'utilisateur s'il n'est pas dans la liste
            const participant = {
                login: currentUser.username,
                alias: currentUser.username,
                ready: true,
                id: currentUser.id,
                eliminate: false
            };
            userX.getTournament.addParticipant(participant);
        }
    }
    if (!container.scrollViewer)
    {
        container.scrollViewer = new ScrollViewer();
        container.scrollViewer.width = "400px";
        container.scrollViewer.height = "200px";
        container.scrollViewer.background = "transparent";
        container.scrollViewer.barColor = UIData.text.color;
        container.scrollViewer.thickness = 0;
        container.scrollViewer.barSize = 10;
        container.scrollViewer.color = "black";
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
    const participantCount = userX.getTournament.getParticipants.length;
    text.text = "List (" + participantCount + ")";
    text.color = UIData.text.color;
    text.width = "100%";
    text.height = "50px";
    text.fontSize = UIData.text.fontSize - 3;
    text.fontFamily = UIData.text.fontFamily;
    text.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    panel.addControl(text);    

    for (let i = 0; i < userX.getTournament.getParticipants.length; i++)
    {
        const test = new TextBlock();
        test.text = userX.getTournament.getParticipants[i].login;
        test.height = "30px";
        test.width = "300px";
        test.paddingLeft = "20px";
        test.fontSize = UIData.text.fontSize - 3;
        test.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        test.fontFamily = UIData.text.fontFamily;
        test.color = UIData.text.color;
        panel.addControl(test);

        test.onPointerClickObservable.add(() => {
            if (!userX.getTournament)
                return ;
            if (userX.getTournament.getParticipants[i].login !== userX.getUser!.username)
            userX.getTournament?.removeParticipant(userX.getTournament.getParticipants[i]);
            genWaitingList(userX, container, lists);
        })

        test.onPointerEnterObservable.add(() => {
            test.color = UIData.button.hoveredBackground;
        });

        test.onPointerOutObservable.add(() => {
            test.color = UIData.text.color;
        })
    }
}

function genRowLogin(
    userX: UserX,
    container: {scrollViewer: ScrollViewer | null},
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
    login.placeholderText = "Alias";
    login.width = "100px";
    login.height = row.height + "px";
    login.color = UIData.text.color;
    login.background = UIData.inputText.background;
    login.focusedBackground = UIData.inputText.focusedBackground;
    login.fontSize = UIData.inputText.fontSize;
    login.thickness = UIData.inputText.thickness;
    login.fontFamily = UIData.inputText.fontFamily;
    row.addControl(login);

    login.onTextChangedObservable.add(() => {
        button.background = UIData.inputText.background;
    });

    const button = new Button("loginButton");
    button.width = "70px";
    button.height = row.height + "px";;
    button.background = UIData.inputText.background;
    button.color = UIData.text.color;
    button.thickness = 1;
    row.addControl(button);

    const textButton = new TextBlock();
    textButton.text = "Add";
    textButton.color = UIData.text.color;
    textButton.fontFamily = UIData.text.fontFamily;
    textButton.fontSize = UIData.text.fontSize - 2;
    button.addControl(textButton);

    button.onPointerClickObservable.add(() => {
        if (login.text === "")
        {
            button.background = "rgba(206, 115, 138, 1)";
            return ;
        }
        else
            button.background = UIData.inputText.background;
        /* RECHERCHE DANS LA BDD SI L'UTILISATEUR EXISTE */
        // Note: Pour l'instant, on génère un ID temporaire négatif pour les participants ajoutés manuellement
        // En production, il faudrait chercher l'utilisateur dans la BDD pour obtenir son vrai ID
        const tempId = -(Date.now() % 1000000); // ID temporaire négatif pour éviter les conflits
        const participant = {
            login: login.text,
            alias: login.text,
            ready: true,
            id: tempId,
            eliminate: false
        };
        login.text = "";
        if (!userX.getTournament?.addParticipant(participant))
            genWaitingList(userX, container, lists);
    })
    return (row);
}

export function genInvitationPage(
    userX: UserX
) : Rectangle
{
    const container = {
        scrollViewer : null
    }

    const page = new Rectangle();
    page.paddingTop = "20px";
    page.width = "100%";
    page.height = "100%";
    page.thickness = 0;

    const panel = new StackPanel();
    panel.isVertical = true;
    panel.paddingTop = "70px";
    panel.width = "90%";
    panel.spacing = 10;
    page.addControl(panel);

    const title = new TextBlock();
    title.text = "Participants";
    title.color = UIData.title.color;
    title.fontSize = UIData.title.fontSize;
    title.fontFamily = UIData.title.fontFamily;
    title.width = "200px";
    title.height = "80px";
    panel.addControl(title);


    panel.addControl(genRowLogin(userX, container, panel));
    genWaitingList(userX, container, panel);

    return (page);
}