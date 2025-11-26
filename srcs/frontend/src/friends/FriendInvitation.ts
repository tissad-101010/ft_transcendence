

import { PromiseUpdateResponse } from "./api/friends.api";

export class FriendInvitation
{

    private createdAt: Date;
    private usernames : string[];

    constructor(usernames: string[], createdAt: Date)
    {
        this.usernames = usernames;
        this.createdAt = createdAt;
    }


    // PUBLIC METHODS
    async accept() : Promise<PromiseUpdateResponse>
    {
        return ()
    }

    cancel()
    {

    }

    refuse()
    {

    }

    block()
    {

    }

    // PRIVATE METHODS

    // GETTERS
    get getUsernames() : string[]
    {
        return (this.usernames);
    }

    get getCreatedAt() : Date
    {
        return (this.createdAt);
    }

}