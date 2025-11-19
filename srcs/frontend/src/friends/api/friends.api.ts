// src/controllers/friends.api.ts
const FRIENDS_API = "/friend"; // passe par le proxy Nginx

async function fetchJson(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url, { ...options, credentials: "include" });
    const data = await response.json().catch(() => ({}));
    if (response.ok) return { success: true, data };
    else return { success: false, message: data.message || "Request failed" };
  } catch (err) {
    console.error(err);
    return { success: false, message: "Network error or server not reachable" };
  }
}

// Invitations
export async function sendFriendInvite(friendId: string) {
  return fetchJson(`${FRIENDS_API}/invite/${friendId}`, { method: "POST" });
}

export async function acceptFriendInvite(friendId: string) {
  return fetchJson(`${FRIENDS_API}/accept/${friendId}`, { method: "POST" });
}

export async function rejectFriendInvite(friendId: string) {
  return fetchJson(`${FRIENDS_API}/reject/${friendId}`, { method: "POST" });
}

export async function removeFriend(friendId: string) {
  return fetchJson(`${FRIENDS_API}/${friendId}`, { method: "DELETE" });
}

export async function blockUser(friendId: string) {
  return fetchJson(`${FRIENDS_API}/block/${friendId}`, { method: "POST" });
}

// Listes
export async function fetchSentInvites() {
  return fetchJson(`${FRIENDS_API}/invites/sent`);
}

export async function fetchReceivedInvites() {
  return fetchJson(`${FRIENDS_API}/invites/received`);
}

export async function fetchFriendsList() {
  return fetchJson(`${FRIENDS_API}`);
}
