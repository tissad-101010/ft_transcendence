

export async function listInvitations(
  idUser: string
) : Promise<{success:boolean; message?: string; data?: any}>
{
  try 
  {
    const response = await fetch("https://localhost:8443/friends/invitations", {
      method: "GET",
      headers: {
        "Content-Type" : "application/json",
        Accept: "application/json"
      },
      credentials: "include",
      body: JSON.stringify({idUser})
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