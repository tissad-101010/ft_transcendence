import { FriendInvitation } from "../FriendInvitation";


export interface PromiseUpdateResponse
{
    success: boolean;
    message: string;
}


interface infoFriend
{
  avatarUrl: string;
  lastLogin: Date;
}

export interface PromiseGetInfoFriendResponse
{
  success: boolean;
  message?: string;
  data?: infoFriend;
}

export enum StatusInvitation
{
    ACCEPTED,
    DECLINED,
    BLOCKED,
    PENDING,
    CANCELED
}

const serviceUrl = "https://localhost:8443";

export async function getInfoFriend(username: string): Promise<PromiseGetInfoFriendResponse>
{
  try
  {
    const call = await fetch(`${serviceUrl}/api/infoFriend?username=${username}`, {
      method: "GET",
      credentials: "include"
    });
    const response = await call.json();
    if (response.success)
      return ({success: true, data: response.data});
    else
      return ({success: false, message: response.message || "Server error"});
  } catch (err: any)
  {
    console.error("Error get info user", err);
    return ({success: false, message: "An error occurred during getInfoFriend"});
  }
}

export async function removeInvitation(
  invitation: FriendInvitation
) : Promise<{success: boolean, message: string}>
{
  try
  {
    const call = await fetch(`${serviceUrl}/friend/remove/${invitation.getUsernames[0]}/${invitation.getUsernames[1]}`, {
      method: "DELETE",
      credentials: "include"
    });
    const response = await call.json();
    return (response);
  } catch(err: any)
  {
    console.error('Error remove invitation', err);
    return ({success: false, message: 'Network or unexpected error'});
  }
}

export async function updateInvitation(param: StatusInvitation, invitation: FriendInvitation) : Promise<PromiseUpdateResponse>
{
  try
  {
    let mode: string = "";
    switch (param)
    {
      case StatusInvitation.ACCEPTED:
        mode = "/accept";
        break;
      case StatusInvitation.BLOCKED:
        mode = "/blocked";
        break;
      case StatusInvitation.DECLINED:
        mode = "/decline";
        break;
    }
    const call = await fetch(`${serviceUrl}/friend/invite${mode}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user1: invitation.getUsernames[0],
        user2: invitation.getUsernames[1]
      })
    });
    const response = await call.json();
    if (response.success)
      return ({success: true, message: "Demande prise en compte"});
    else
      return ({success: false, message: response.message || "Server error"});
  } catch (err: any)
  {
    console.error('Error update friend invitation', err);
    return ({success: false, message: 'Network or unexpected error'});
  }
}

export async function listInvitations() : Promise<{success:boolean; message?: string; data?: any}>
{
  try 
  {
    const response = await fetch(`${serviceUrl}/friend/invitations`, {
      method: "GET",
      credentials: "include"
    });
    const data = await response.json();
    if (response.ok)
      return ({success: true, data: data});
    else
      return ({success: false, message: data.message});
  } catch (err)
  {
    console.error(err);
    return ({success: false, message: "An error occurred during listInvitation"});
  }
};

export async function sendFriendInvitation(
  username: string
) : Promise <{success: boolean; message?: string; data?: any}>
{
  try 
  {
    console.log("API Username = " + username );
    const call : any = await fetch(`${serviceUrl}/friend/invite`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({friendUsername: username})
    });
    const response = await call.json();
    if (response.success)
      return ({success: true, data: response.data});
    else
      return ({success: false, message: response.message || "Server error"});
  } catch (error: any)
  {
    console.error('Error sending friend invitation', error);
    return ({success: false, message: 'Network or unexpected error'});
  }
}