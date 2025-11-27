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

export enum statusInvitation
{
    ACCEPTED,
    DECLINED,
    BLOCKED,
    PENDING
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

export async function updateInvitation(param: statusInvitation, invitation: FriendInvitation) : Promise<PromiseUpdateResponse>
{
  try
  {
    let mode: string = "";
    switch (param)
    {
      case statusInvitation.ACCEPTED:
        mode = "/accept";
        break;
      case statusInvitation.BLOCKED:
        mode = "/blocked";
        break;
      case statusInvitation.DECLINED:
        mode = "/decline";
        break;
    }
    const call = await fetch(`${serviceUrl}/invite${mode}`, {
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