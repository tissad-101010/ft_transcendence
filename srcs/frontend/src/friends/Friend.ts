
export interface Message
{
    sender: string;
    content: string;
    date: Date;
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
    public async loadMessages() : Promise<{success: boolean, message: string}>
    {
        // APPEL API POUR RECUPERER LES MESSAGES PRESENTS DANS SERVICE-CHAT
        return ({success: true, message: "Messages bien charges"});
    }

    public async loadMatchs() : Promise<{success: boolean, message: string}>
    {
        // APPEL API POUR RECUPERER LES MATCHS PRESENTS DANS SERVICE-GAME
        return ({success: true, message: "Matchs bien charges"});
    }

    // PRIVATE METHODS

    // GETTERS
    get getUsername() : string
    {
        return (this.username);
    }

    get getAvatarUrl() : string
    {
        return (this.username);
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