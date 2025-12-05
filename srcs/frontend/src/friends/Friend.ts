import { chatApi } from "../chatApi/chat.api";
import { removeFriend } from "./api/friends.api";
export interface Message
{
    id: number;
    content: string;
    sentAt: Date;
    senderId: number;
}


export interface Match
{
    id: number;
    participants: string[];
    score: number[];
    duration: number;
    date: Date;
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
        // APPEL API POUR RECUPERER LES MATCHS PRESENTS DANS SERVICE-GAME
        return ({success: true, message: "Matchs bien charges"});
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