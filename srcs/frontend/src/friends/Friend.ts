

export class Friend
{
    private username: string;
    private lastLogin: Date;
    private avatarUrl: string;
    private dateAccepted: Date;
    
    
    constructor(username: string, avatarUrl: string, lastLogin: Date, date: Date)
    {
        this.username = username;
        this.avatarUrl = avatarUrl;
        this.lastLogin = lastLogin;
        this.dateAccepted = date;
    }

    // PUBLIC METHODS


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

}