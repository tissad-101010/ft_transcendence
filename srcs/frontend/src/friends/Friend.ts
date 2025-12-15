import { chatApi } from "../chatApi/chat.api";
import { listMatch, removeFriend } from "./api/friends.api";
export interface Message
{
    id: number;
    content: string;
    sentAt: Date;
    senderId: number;
    senderUsername: string;
    receiverUsername: string;
}


export interface Match
{
    id: number;
    participants: string[];
    score: number[];
    // duration: number;
    date: Date;
    startedAt: Date;
}

export class Friend
{
    private username: string;
    private lastLogin: Date;
    private avatarUrl: string;
    private dateAccepted: Date;
    private online: boolean;
    private messages: Message[];
    private matchs: Match[];
    
    
    constructor(username: string, avatarUrl: string, lastLogin: Date, date: Date)
    {
        this.username = username;
        this.avatarUrl = avatarUrl;
        this.lastLogin = lastLogin;
        this.dateAccepted = date;
        this.online = false;
        this.messages = [];
        this.matchs = [];
    }

    // PUBLIC METHODS
    public async loadMessages(username:string) : Promise<Message[]>
    {
        // APPEL API POUR RECUPERER LA DISCUSSION EXISTANTE
        console.log("Chargement des messages pour", this.username);
        const conversations = await chatApi.getUserConversations(username) as { otherUsername: string; messages?: Message[] }[];
        console.log("Messages reçus :", conversations);
        
        const conv = conversations.find(c => c.otherUsername === this.username);

        this.messages = conv?.messages ?? [];
        
        return (this.messages);
    }

    public async loadMatchs() : Promise<{success: boolean, message: string}>
    {
        this.matchs = [];
        const response = await listMatch(this.username);
        if (response.success)
        {
            response.data.forEach((m: any) => {
                this.matchs.push({
                    id: m.id,
                    score: [m.score1, m.score2],
                    participants: [m.player1.login, m.player2.login],
                    date: new Date(m.finishedAt),
                    startedAt: new Date(m.startedAt)
                });
            });
            console.log("Etat des matchs: ", this.matchs);
            return ({success: true, message: "Matchs recuperes"});
        }
        else
            return ({success:false, message: response.message});
    }

    public async delete(username: string) : Promise<{success: boolean, message: string}>
    {
        return (await removeFriend(this.username, username));
    }

    // PRIVATE METHODS

    // GETTERS
    get getUsername() : string
    {
        return (this.username);
    }

    get getAvatarUrl() : string
    {
        return (this.avatarUrl);
    }

    get getLastLogin() : Date
    {
        return (this.lastLogin);
    }

    get getDateAccepted() : Date
    {
        return (this.dateAccepted);
    }

    get getOnline() : boolean
    {
        return (this.online);
    }

    get getMessages() : Message[]
    {
        return (this.messages);
    }

    get getMatchs() : Match[]
    {
        return (this.matchs);
    }

}