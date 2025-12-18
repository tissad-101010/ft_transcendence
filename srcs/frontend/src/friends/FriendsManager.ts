
import { FriendInvitation } from "./FriendInvitation";
import { Friend } from "./Friend";

import {
    listInvitations,
    StatusInvitation,
    PromiseUpdateResponse,
    getInfoFriend,
    sendFriendInvitation,
    removeBlocked,
    PromiseGetInfoFriendResponse
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
        {
            this.invitations.sent.push(
                new FriendInvitation(
                    [ response.data.fromUserUsername, response.data.toUserUsername ],
                    new Date(response.data.createdAt),
                    StatusInvitation.PENDING
                )
            );
            return ({success: true, data: response.data});
        }
        else
            return ({success: false, message: response.message});
    }

    public async deleteInvitation(
        invitation: FriendInvitation
    ) : Promise<PromiseUpdateResponse>
    {
        const response : PromiseUpdateResponse = await invitation.delete();
        if (response.success)
        {
            let index = this.invitations.sent.findIndex(
                (i: FriendInvitation) => i.getUsernames[0] === invitation.getUsernames[0]
                    && i.getUsernames[1] === invitation.getUsernames[1]);
            if (index === -1)
            {
                return ({success: false, message: "Invitation not found"});
            }
            this.invitations.sent.splice(index, 1);
            return ({success: true, message: "Invitation removed"});
        }
        return (response);
    }

    public async blockFriend(friend: Friend)
    {
        const response : PromiseUpdateResponse = await friend.block(this.userX.getUser!.username);
        if (response.success){
            let index = this.friends.findIndex((i : Friend) => i === friend);
            if (index === -1)
                return ({success: false, message: `${friend.getUsername} not found`});
            this.friends.splice(index, 1);
            this.blockeds.push(friend.getUsername);
            return ({success: true, message: `${friend.getUsername} blocked`});
        }
        return (response);
    }

    public async deleteBlocked(
        username: string
    ) : Promise<PromiseUpdateResponse>
    {

        const response : PromiseUpdateResponse = await removeBlocked(username, this.userX.getUser!.username);
        if (response.success)
        {
            let index = this.blockeds.findIndex((i: string) => i === username);
            if (index === -1)
                return ({success: false, message: `${username} not found`});
            this.blockeds.splice(index, 1);
            return ({success: true, message: `${username} unblocked`});
        }
        return (response);
    }

    public async deleteFriend(friend: Friend) : Promise<{success: boolean, message: string}>
    {
        const response : PromiseUpdateResponse = await friend.delete(this.userX.getUser!.username);
        if (response.success)
        {
            const index = this.friends.findIndex((f) => f.getUsername === friend.getUsername);
            if (index === -1)
                return ({success: false, message: `${friend.getUsername} not found`});
            this.friends.splice(index, 1);
            return ({success: true, message: `${friend.getUsername} removed`});
        }
        return (response);
    }

    public async updateInvitation(invitation: FriendInvitation, param: StatusInvitation) : Promise<PromiseUpdateResponse>
    {
        let response : PromiseUpdateResponse = {success: false, message: "Invalid parameter"};
        switch (param)
        {
            case StatusInvitation.ACCEPTED:
                response = await invitation.accept();
                if (response.success)
                {
                    let index = this.invitations.received.findIndex(
                        (i: FriendInvitation) => i.getUsernames[0] === invitation.getUsernames[0]
                            && i.getUsernames[1] === invitation.getUsernames[1]);
                    if (index === -1)
                    {
                        return ({success: false, message: "Invitation not found"});
                    }
                    const data : PromiseGetInfoFriendResponse = await getInfoFriend(invitation.getUsernames[0]);
                    if (data.success)
                    {
                        this.invitations.received.splice(index, 1);
                        this.friends.push(new Friend(invitation.getUsernames[0], data.data!.avatarUrl, data.data!.lastLogin, new Date()));
                        return ({success: true, message: response.message});
                    }
                    else
                        return ({success: false, message: data.message!});
                }
                break;
            case StatusInvitation.BLOCKED:
                response = await invitation.block();
                if (response.success)
                {
                    let index = this.invitations.received.findIndex(
                        (i: FriendInvitation) => i.getUsernames[0] === invitation.getUsernames[0]
                            && i.getUsernames[1] === invitation.getUsernames[1]);
                    if (index === -1)
                    {
                        return ({success: false, message: "Invitation not found"});
                    }
                    this.invitations.received.splice(index, 1);
                    this.blockeds.push(invitation.getUsernames[0]);
                }
                break;
            case StatusInvitation.DECLINED:
                response = await invitation.delete();
                if (response.success)
                {
                    let index = this.invitations.received.findIndex(
                        (i: FriendInvitation) => i.getUsernames[0] === invitation.getUsernames[0]
                            && i.getUsernames[1] === invitation.getUsernames[1]); 
                    if (index === -1)
                    {
                        return ({success: false, message: "Invitation not found"});
                    }
                    this.invitations.received.splice(index, 1);
                    response = ({success: true, message: "Invitation declined"});
                }
                break;
        }
        return (response);
    }

    public async loadData() : Promise<{success: boolean, message: string}>
    {
        if (!this.userX.getUser)
            return ({success: false, message: "You're not online"});
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
                else if (d.status === "BLOCKED" 
                    && d.toUserUsername === this.userX.getUser.username)
                    this.blockeds.push(username);
                // INVITATION PENDING //
                else if (d.status === "PENDING")
                    if (username === d.toUserUsername)
                        this.invitations.sent.push(new FriendInvitation(
                            [ d.fromUserUsername, d.toUserUsername ],
                            new Date(d.createdAt),
                            StatusInvitation.PENDING
                        ));
                    else
                       this.invitations.received.push(new FriendInvitation(
                            [ d.fromUserUsername, d.toUserUsername ],
                            new Date(d.createdAt),
                            StatusInvitation.PENDING
                        )); 
            }
            // SUCCESS //
            return ({success: true, message: "Loading complete"});
        }
        else
        {
            // ERROR //
            console.error(call.message);
            return ({success: false, message: call.message || "unknown error"});
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