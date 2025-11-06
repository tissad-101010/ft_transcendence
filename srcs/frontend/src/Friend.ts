

interface IMessage
{
    content: string;
    date: Date;
    id: number;
    sender: number;
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

    public loadMessages() : IMessage[]
    {
        // APPEL API POUR RECUPERER LA DISCUSSION EXISTANTE

        // DONNEES BRUTES POUR TESTER AVANT BDD
        if (this.login === "Lolo")
        {
            this.messages = [
                {
                    id: 1,
                    content: "Hey, you started working on the backend yet?",
                    sender: 0,
                    date: new Date("2025-10-22T18:45:00Z")
                },
                {
                    id: 2,
                    content: "Not yet. I got stuck fixing that routing issue.",
                    sender: this.id,
                    date: new Date("2025-10-22T19:02:10Z")
                },
                {
                    id: 3,
                    content: "Routing again? That bug’s cursed.",
                    sender: 0,
                    date: new Date("2025-10-22T19:05:30Z")
                },
                {
                    id: 4,
                    content: "Tell me about it. I might rewrite that part entirely.",
                    sender: this.id,
                    date: new Date("2025-10-22T19:07:45Z")
                },
                {
                    id: 5,
                    content: "Alright, I’ll take care of the DB schema tomorrow.",
                    sender: 0,
                    date: new Date("2025-10-22T19:10:00Z")
                },
                {
                    id: 6,
                    content: "Cool. I’ll push my changes tonight.",
                    sender: this.id,
                    date: new Date("2025-10-22T22:40:00Z")
                },
                {
                    id: 7,
                    content: "Morning! Schema’s done and working fine.",
                    sender: 0,
                    date: new Date("2025-10-23T08:12:30Z")
                },
                {
                    id: 8,
                    content: "Nice. I checked your commit, looks clean.",
                    sender: this.id,
                    date: new Date("2025-10-23T09:00:15Z")
                },
                {
                    id: 9,
                    content: "Finally something that didn’t break.",
                    sender: 0,
                    date: new Date("2025-10-23T09:02:00Z")
                },
                {
                    id: 10,
                    content: "Don’t jinx it.",
                    sender: this.id,
                    date: new Date("2025-10-23T09:02:45Z")
                },
                {
                    id: 11,
                    content: "Hey, small update — front build’s failing again.",
                    sender: this.id,
                    date: new Date("2025-10-25T14:25:10Z")
                },
                {
                    id: 12,
                    content: "How?? We didn’t touch it since Thursday!",
                    sender: 0,
                    date: new Date("2025-10-25T14:27:30Z")
                },
                {
                    id: 13,
                    content: "Yeah, apparently it just *decided* to stop working.",
                    sender: this.id,
                    date: new Date("2025-10-25T14:30:00Z")
                },
                {
                    id: 14,
                    content: "Amazing. I love when code develops free will.",
                    sender: 0,
                    date: new Date("2025-10-25T14:31:00Z")
                },
                {
                    id: 15,
                    content: "Got it running again. Typo in a variable name.",
                    sender: this.id,
                    date: new Date("2025-10-26T10:55:00Z")
                },
                {
                    id: 16,
                    content: "Classic. I swear variables rename themselves overnight.",
                    sender: 0,
                    date: new Date("2025-10-26T11:02:15Z")
                },
                {
                    id: 17,
                    content: "Project’s stable now. You free to test later?",
                    sender: this.id,
                    date: new Date("2025-10-27T15:10:00Z")
                },
                {
                    id: 18,
                    content: "Yeah, let’s do a run after dinner.",
                    sender: 0,
                    date: new Date("2025-10-27T15:12:30Z")
                }
            ];
        } else if (this.login === "Tissad")
        {
            this.messages = [
                {
                    id: 1,
                    content: "Hey, did you start the API integration yet?",
                    sender: 0,
                    date: new Date("2025-10-20T09:30:00Z")
                },
                {
                    id: 2,
                    content: "Not really, got stuck on the auth tokens.",
                    sender: this.id,
                    date: new Date("2025-10-20T09:45:10Z")
                },
                {
                    id: 3,
                    content: "Ah, those always cause trouble. Which endpoint?",
                    sender: 0,
                    date: new Date("2025-10-20T09:50:30Z")
                },
                {
                    id: 4,
                    content: "The login one. The token refresh keeps failing.",
                    sender: this.id,
                    date: new Date("2025-10-20T09:53:50Z")
                },
                {
                    id: 5,
                    content: "Maybe we can switch to OAuth2 for that.",
                    sender: 0,
                    date: new Date("2025-10-20T10:00:00Z")
                },
                {
                    id: 6,
                    content: "Yeah, I’ll try that tonight and push changes.",
                    sender: this.id,
                    date: new Date("2025-10-20T22:15:00Z")
                },
                {
                    id: 7,
                    content: "Morning! Any luck with OAuth2?",
                    sender: 0,
                    date: new Date("2025-10-21T08:20:00Z")
                },
                {
                    id: 8,
                    content: "Yep, login works now. Token refresh fixed.",
                    sender: this.id,
                    date: new Date("2025-10-21T09:05:30Z")
                },
                {
                    id: 9,
                    content: "Perfect. I’ll start testing the user routes.",
                    sender: 0,
                    date: new Date("2025-10-21T09:10:00Z")
                },
                {
                    id: 10,
                    content: "Make sure to check the edge cases for invalid tokens.",
                    sender: this.id,
                    date: new Date("2025-10-21T09:12:45Z")
                },
                {
                    id: 11,
                    content: "Will do. Also, found a minor bug in profile update.",
                    sender: 0,
                    date: new Date("2025-10-23T13:30:10Z")
                },
                {
                    id: 12,
                    content: "Which one? I thought that part was stable.",
                    sender: this.id,
                    date: new Date("2025-10-23T13:33:00Z")
                },
                {
                    id: 13,
                    content: "If you send an empty string for username, it crashes.",
                    sender: 0,
                    date: new Date("2025-10-23T13:35:20Z")
                },
                {
                    id: 14,
                    content: "Ah yes, forgot to validate that field. I’ll fix it.",
                    sender: this.id,
                    date: new Date("2025-10-23T13:40:00Z")
                },
                {
                    id: 15,
                    content: "Thanks! I’ll re-run the tests afterwards.",
                    sender: 0,
                    date: new Date("2025-10-23T14:05:00Z")
                },
                {
                    id: 16,
                    content: "Patch applied. Everything should be safe now.",
                    sender: this.id,
                    date: new Date("2025-10-24T10:10:00Z")
                },
                {
                    id: 17,
                    content: "Awesome. Let’s merge and deploy later today.",
                    sender: this.id,
                    date: new Date("2025-10-24T10:15:00Z")
                },
                {
                    id: 18,
                    content: "Sounds good. I’ll handle the staging server.",
                    sender: 0,
                    date: new Date("2025-10-24T10:20:00Z")
                }
            ];
        }
        
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