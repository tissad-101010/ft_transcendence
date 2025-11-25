
// UTILS FOR USER-SERVICE
import {
  usersClient,
  serviceUsersURL
} from "./usersClient";

// ERRORS FOR THROW
import { 
    UserNotFoundError,
    RemoteServiceUnavailableError 
} from "../../../errors/friends.error";

export async function getUserById(id: string)
{
  // CALL USER SERVICE
  const res = await usersClient.get(`${serviceUsersURL}/internalUser/user?id=${id}`);
  const data = res.data;
  // ERRORS
  if (!data.success)
  {
    // USER NOT FOUND
    if (res.status === 404)
      throw new UserNotFoundError("");
    // SERVICE USER ERROR
    if (res.status === 503)
      throw new RemoteServiceUnavailableError();
    // OTHER ERROR
    return (null);
  }
  // SUCCESS
  return (data.data);
}

export async function getUserByUsername(username: string)
{
  // CALL USER SERVICE
  const res = await usersClient.get(`${serviceUsersURL}/internalUser/user?username=${username}`);
  const data = res.data;
  // ERRORS
  if (!data.success)
  {
    // USER NOT FOUND
    if (res.status === 404)
      throw new UserNotFoundError(username);
    // SERVICE USER ERROR
    if (res.status === 503)
      throw new RemoteServiceUnavailableError();
    // OTHER ERROR
    return (null);
  }
  // SUCCESS
  return (data.data);
}