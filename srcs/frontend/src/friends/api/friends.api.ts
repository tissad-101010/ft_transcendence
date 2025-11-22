
const friendsServiceUrl = "https://localhost:8443";


type ReponseFetch = {
  sucess: boolean;
  message?: string;
  data?: any;
  status: number;
}

export async function listInvitations(
  idUser: string
) : Promise<{success:boolean; message?: string; data?: any}>
{
  try 
  {
    const response = await fetch(`${friendsServiceUrl}/friend/invitations`, {
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
    const call : any = await fetch(`${friendsServiceUrl}/friend/invite`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({username})
    });
    const response = await call.json();
    if (response.ok)
      return ({success: true, data: response.data});
    else
      return ({success: false, message: response.message || "Server error"});
  } catch (error: any)
  {
    console.error('Error sending friend invitation', error);
    return ({success: false, message: 'Network or unexpected error'});
  }
}