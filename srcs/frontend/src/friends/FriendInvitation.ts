import { PromiseUpdateResponse } from "./api/friends.api";

import { updateInvitation } from "./api/friends.api";
import { StatusInvitation } from "./api/friends.api";

export class FriendInvitation
{

    private createdAt: Date;
    private status: StatusInvitation;
    private usernames : string[]; // 0: from 1: to

    constructor(usernames: string[], createdAt: Date, status: StatusInvitation)
    {
        this.usernames = usernames;
        this.createdAt = createdAt;
        this.status = status;
    }


    // PUBLIC METHODS
    async accept() : Promise<PromiseUpdateResponse>
    {
        const response: PromiseUpdateResponse = await updateInvitation(StatusInvitation.ACCEPTED, this);
        if (response.success)
            this.status = StatusInvitation.ACCEPTED;
        return (response);
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