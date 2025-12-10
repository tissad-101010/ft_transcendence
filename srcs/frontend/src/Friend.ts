import { chatApi } from "./chatApi/chat.api";


interface IMessage
{
    id: number;
    content: string;
    sentAt: Date;
    senderId: number;
}

export interface IMatch
{
    id: number;
    participants: number[];
    score: number[];
    duration: number;
    date: Date;
}


export class Friend
{
    private id: number;
    private login: string;
    private online: boolean;
    private messages: IMessage[];
    private matchs: IMatch[];
    constructor(id: number, login: string, online: boolean)
    {
        this.id = id;
        this.login = login;
        this.online = online;
        this.messages = [];
        this.matchs = [];
    }

    public loadMatchs() : IMatch[]
    {
        this.matchs = [
            {
                id: 1,
                participants: [this.id, 202],
                score: [2, 1],
                duration: 90 * 60 * 1000,
                date: new Date("2019-03-10T18:30:00Z"),
            },
            {
                id: 2,
                participants: [this.id, 303],
                score: [0, 3],
                duration: 91 * 60 * 1000,
                date: new Date("2020-07-05T19:00:00Z"),
            },
            {
                id: 3,
                participants: [this.id, 404],
                score: [0, 1],
                duration: 94 * 60 * 1000,
                date: new Date("2021-01-22T20:15:00Z"),
            },
            {
                id: 4,
                participants: [this.id, 505],
                score: [3, 2],
                duration: 89 * 60 * 1000,
                date: new Date("2021-12-11T17:45:00Z"),
            },
            {
                id: 5,
                participants: [this.id, 606],
                score: [0, 2],
                duration: 92 * 60 * 1000,
                date: new Date("2022-10-02T21:00:00Z"),
            },
            {
                id: 6,
                participants: [this.id, 707],
                score: [1, 2],
                duration: 95 * 60 * 1000,
                date: new Date("2023-08-19T19:15:00Z"),
            },
            {
                id: 7,
                participants: [this.id, 808],
                score: [4, 1],
                duration: 90 * 60 * 1000,
                date: new Date("2024-05-05T18:45:00Z"),
            },
            {
                id: 8,
                participants: [this.id, 909],
                score: [2, 3],
                duration: 93 * 60 * 1000,
                date: new Date("2025-01-25T20:30:00Z"),
            },
            {
                id: 9,
                participants: [this.id, 202],
                score: [3, 0],
                duration: 88 * 60 * 1000,
                date: new Date("2026-09-14T18:00:00Z"),
            },
            {
                id: 10,
                participants: [this.id, 303],
                score: [3, 2],
                duration: 90 * 60 * 1000,
                date: new Date("2027-06-03T19:30:00Z"),
            },
            {
                id: 11,
                participants: [this.id, 202],
                score: [2, 1],
                duration: 90 * 60 * 1000,
                date: new Date("2019-03-10T18:30:00Z"),
            },
            {
                id: 12,
                participants: [this.id, 303],
                score: [0, 3],
                duration: 91 * 60 * 1000,
                date: new Date("2020-07-05T19:00:00Z"),
            },
            {
                id: 13,
                participants: [this.id, 404],
                score: [0, 1],
                duration: 94 * 60 * 1000,
                date: new Date("2021-01-22T20:15:00Z"),
            },
            {
                id: 14,
                participants: [this.id, 505],
                score: [3, 2],
                duration: 89 * 60 * 1000,
                date: new Date("2021-12-11T17:45:00Z"),
            },
            {
                id: 15,
                participants: [this.id, 606],
                score: [0, 2],
                duration: 92 * 60 * 1000,
                date: new Date("2022-10-02T21:00:00Z"),
            },
            {
                id: 16,
                participants: [this.id, 707],
                score: [1, 2],
                duration: 95 * 60 * 1000,
                date: new Date("2023-08-19T19:15:00Z"),
            },
            {
                id: 17,
                participants: [this.id, 808],
                score: [4, 1],
                duration: 90 * 60 * 1000,
                date: new Date("2024-05-05T18:45:00Z"),
            },
            {
                id: 18,
                participants: [this.id, 909],
                score: [2, 3],
                duration: 93 * 60 * 1000,
                date: new Date("2025-01-25T20:30:00Z"),
            },
            {
                id: 19,
                participants: [this.id, 202],
                score: [3, 0],
                duration: 88 * 60 * 1000,
                date: new Date("2026-09-14T18:00:00Z"),
            },
            {
                id: 20,
                participants: [this.id, 303],
                score: [3, 2],
                duration: 90 * 60 * 1000,
                date: new Date("2027-06-03T19:30:00Z"),
            },
            {
                id: 21,
                participants: [this.id, 202],
                score: [2, 1],
                duration: 90 * 60 * 1000,
                date: new Date("2019-03-10T18:30:00Z"),
            },
            {
                id: 22,
                participants: [this.id, 303],
                score: [0, 3],
                duration: 91 * 60 * 1000,
                date: new Date("2020-07-05T19:00:00Z"),
            },
            {
                id: 23,
                participants: [this.id, 404],
                score: [0, 1],
                duration: 94 * 60 * 1000,
                date: new Date("2021-01-22T20:15:00Z"),
            },
            {
                id: 24,
                participants: [this.id, 505],
                score: [3, 2],
                duration: 89 * 60 * 1000,
                date: new Date("2021-12-11T17:45:00Z"),
            },
            {
                id: 25,
                participants: [this.id, 606],
                score: [0, 2],
                duration: 92 * 60 * 1000,
                date: new Date("2022-10-02T21:00:00Z"),
            },
            {
                id: 26,
                participants: [this.id, 707],
                score: [1, 2],
                duration: 95 * 60 * 1000,
                date: new Date("2023-08-19T19:15:00Z"),
            },
            {
                id: 27,
                participants: [this.id, 808],
                score: [4, 1],
                duration: 90 * 60 * 1000,
                date: new Date("2024-05-05T18:45:00Z"),
            },
            {
                id: 28,
                participants: [this.id, 909],
                score: [2, 3],
                duration: 93 * 60 * 1000,
                date: new Date("2025-01-25T20:30:00Z"),
            },
            {
                id: 29,
                participants: [this.id, 202],
                score: [3, 0],
                duration: 88 * 60 * 1000,
                date: new Date("2026-09-14T18:00:00Z"),
            },
            {
                id: 30,
                participants: [this.id, 303],
                score: [3, 2],
                duration: 90 * 60 * 1000,
                date: new Date("2027-06-03T19:30:00Z"),
            },
            {
                id: 31,
                participants: [this.id, 202],
                score: [2, 1],
                duration: 90 * 60 * 1000,
                date: new Date("2019-03-10T18:30:00Z"),
            },
            {
                id: 32,
                participants: [this.id, 303],
                score: [0, 3],
                duration: 91 * 60 * 1000,
                date: new Date("2020-07-05T19:00:00Z"),
            },
            {
                id: 33,
                participants: [this.id, 404],
                score: [0, 1],
                duration: 94 * 60 * 1000,
                date: new Date("2021-01-22T20:15:00Z"),
            },
            {
                id: 34,
                participants: [this.id, 505],
                score: [3, 2],
                duration: 89 * 60 * 1000,
                date: new Date("2021-12-11T17:45:00Z"),
            },
            {
                id: 35,
                participants: [this.id, 606],
                score: [0, 2],
                duration: 92 * 60 * 1000,
                date: new Date("2022-10-02T21:00:00Z"),
            },
            {
                id: 36,
                participants: [this.id, 707],
                score: [1, 2],
                duration: 95 * 60 * 1000,
                date: new Date("2023-08-19T19:15:00Z"),
            },
            {
                id: 37,
                participants: [this.id, 808],
                score: [4, 1],
                duration: 90 * 60 * 1000,
                date: new Date("2024-05-05T18:45:00Z"),
            },
            {
                id: 38,
                participants: [this.id, 909],
                score: [2, 3],
                duration: 93 * 60 * 1000,
                date: new Date("2025-01-25T20:30:00Z"),
            },
            {
                id: 39,
                participants: [this.id, 202],
                score: [3, 0],
                duration: 88 * 60 * 1000,
                date: new Date("2026-09-14T18:00:00Z"),
            },
            {
                id: 40,
                participants: [this.id, 303],
                score: [3, 2],
                duration: 90 * 60 * 1000,
                date: new Date("2027-06-03T19:30:00Z"),
            },
        ];
        return (this.matchs);
    }
    // warning merge  move loadMessages to src/friend/Friend.ts 
    public async loadMessages(username: string) : Promise<IMessage[]>
    {
        // APPEL API POUR RECUPERER LA DISCUSSION EXISTANTE
        console.log("Chargement des messages pour", this.login);
        const conversations = await chatApi.getUserConversations(username) as { otherUsername: string; messages?: IMessage[] }[];
        console.log("Messages reçus :", conversations);
        
        const conv = conversations.find(c => c.otherUsername === this.login);

        this.messages = conv?.messages ?? [];
        
        return (this.messages);
    }


    public get getMessages() : IMessage[]
    {
        return (this.messages);
    }

    public get getLogin()
    {
        return (this.login);
    }

    public get getId() : number
    {
        return (this.id);
    }

    public get getOnline() : boolean
    {
        return (this.online);
    }
}