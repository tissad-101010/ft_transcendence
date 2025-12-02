
import { FriendInvitation } from "./FriendInvitation";
import { Friend } from "./Friend";

import {
    listInvitations,
    StatusInvitation,
    PromiseUpdateResponse,
    getInfoFriend,
    sendFriendInvitation
} from "./api/friends.api";
import { UserX } from "../UserX";

type invitationFriend = {
    fromUserUsername: string;
    toUserUsername: string;
    status: "PENDING" | "ACCEPTED" | "DECLINED" | "BLOCKED";
    createdAt: Date;
    responsedAt: Date;
};

export interface FriendInvitationsI
{
    sent: FriendInvitation[];
    received: FriendInvitation[];
};

export class FriendManager
{
    // PROPS
    private userX: UserX;
    private invitations : FriendInvitationsI;
    private friends: Friend[];
    private blockeds: string[];

    constructor(userX: UserX)
    {
        this.userX = userX;
        this.invitations = {sent: [], received: []};
        this.friends = [];
        this.blockeds = [];
    }

    // PUBLIC METHODS
    public async sendInvitation(username: string) : Promise<{success: boolean, message?: string, data?: any}> 
    {
        const response = await sendFriendInvitation(username);
        if (response.success)
            return ({success: true, data: response.data});
        else
            return ({success: false, message: response.message});
    }

    public async deleteFriend(friend: Friend) : Promise<boolean>
    {
        // CALL API FOR DELETE FRIEND ON BDD
        // UPDATE TAB WITHOUT FRIEND DELETED
        return (true);
    }

    public async updateInvitation(invitation: FriendInvitation, param: StatusInvitation) : Promise<PromiseUpdateResponse>
    {
        let response : PromiseUpdateResponse = {success: false, message: "Parametre invalide"};
        switch (param)
        {
            case StatusInvitation.ACCEPTED:
                response = await invitation.accept();
                break;
            case StatusInvitation.BLOCKED:
                response = {success: false, message: "Pas encore fait"};
                break;
            case StatusInvitation.DECLINED:
                response = {success: false, message: "Pas encore fait"};
                break;
            case StatusInvitation.CANCELED:
                response = {success: false, message: "Pas encore fait"};
                break;
        }

        return (response);
    }

    public async loadData() : Promise<{success: boolean, message: string}>
    {
        if (!this.userX.getUser)
            return ({success: false, message: "Vous n'etes pas connecte"});
        this.friends = [];
        this.invitations = {sent: [], received: []};
        this.blockeds = [];
        // CALL API TO GET ALL INVITATIONS
        const call = await listInvitations();
        if (call.success)
        {
            // SUCCESS //
            const data : invitationFriend[] = call.data.data;
            for (const d of data)
            {
                let username;
                if (this.userX.getUser?.username !== d.fromUserUsername)
                    username = d.fromUserUsername;
                else
                    username = d.toUserUsername;
                // INVITATION ACCEPTED -> FRIEND //
                if (d.status === "ACCEPTED")
                {
                    // CALL API TO GET INFOS REQUIRED ON USER BDD //
                    const callUser = await getInfoFriend(username);
                    // ERROR //
                    if (!callUser.success)
                        return ({success: false, message: `${username} : ${callUser.message}`});
                    // SUCCESS //
                    if (callUser.data)
                        this.friends.push(new Friend(
                            username,
                            callUser.data.avatarUrl,
                            callUser.data.lastLogin,
                            d.responsedAt
                        ));
                }
                // USER BLOCKED //
                else if (d.status === "BLOCKED")
                    this.blockeds.push(username);
                // INVITATION PENDING //
                else if (d.status === "PENDING")
                    if (username === d.toUserUsername)
                        this.invitations.sent.push(new FriendInvitation(
                            [ d.fromUserUsername, d.toUserUsername ],
                            d.createdAt,
                            StatusInvitation.PENDING
                        ));
                    else
                       this.invitations.received.push(new FriendInvitation(
                            [ d.fromUserUsername, d.toUserUsername ],
                            d.createdAt,
                            StatusInvitation.PENDING
                        )); 
            }
            console.log("VALEURS APRES LOADDATA : ", this.friends, this.blockeds, this.invitations);
            // SUCCESS //
            return ({success: true, message: "Amis, invitations, bloques bien charges"});
        }
        else
        {
            // ERROR //
            console.error(call.message);
            return ({success: false, message: call.message || "erreur inconnue"});
        }
    } 

    // PRIVATE METHODS


    // GETTERS
    get getFriends() : Friend[]
    {
        return (this.friends);
    }

    get getInvitations() : FriendInvitationsI
    {
        return (this.invitations);
    }

    get getBlockeds() : string[]
    {
        return (this.blockeds);
    }
    

}