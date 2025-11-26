
import { FriendInvitation } from "./FriendInvitation";
import { Friend } from "../Friend";

import { paramUpdate } from "./api/friends.api";

export class FriendManager
{
    // PROPS


    constructor()
    {

    }

    // PUBLIC METHODS
    async sendInvitation() : Promise<boolean> 
    {

        return (true);
    }

    async updateInvitation(invitation: FriendInvitation, param: paramUpdate) : Promise<boolean>
    {
        switch (param)
        {
            case paramUpdate.ACCEPTED:
                return (await invitation.accept());
                break;
            case paramUpdate.BLOCKED:
                break;
            case paramUpdate.CANCELED:
                break;
            case paramUpdate.REFUSED:
                break;
        }
        return (true);
    }

    // PRIVATE METHODS

}