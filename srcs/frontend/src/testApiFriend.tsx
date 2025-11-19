// src/components/FriendsManager.tsx
import React, { useState, useEffect } from "react";
import { registerUser, loginUser, fetchUserProfile } from "./auth/controllers/auth.api";
import {
  acceptFriendInvite,
  rejectFriendInvite,
  removeFriend,
  blockUser,
  fetchSentInvites,
  fetchReceivedInvites,
  fetchFriendsList,
  sendFriendInvite,
} from "./friends/api/friends.api";

export default function FriendsManager() {
  // === Auth ===
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState("");

  // === Friends ===
  const [friendId, setFriendId] = useState("");
  const [sentInvites, setSentInvites] = useState<any[]>([]);
  const [receivedInvites, setReceivedInvites] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [output, setOutput] = useState("");

  // --- Auth handlers ---
  const handleRegister = async () => {
    setError("");
    const res = await registerUser(username, email, password);
    if (res.success) setUser(res.data);
    else setError(res.message || "Registration failed");
  };

  const handleLogin = async () => {
    setError("");
    const res = await loginUser(username, password);
    if (res.success) {
      const profile = await fetchUserProfile();
      if (profile.success) setUser(profile.data);
      else setError(profile.message);
    } else {
      setError(res.message || "Login failed");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setFriends([]);
    setSentInvites([]);
    setReceivedInvites([]);
  };

  // --- Friends handlers ---
  const loadFriendsData = async () => {
    const [sentRes, receivedRes, friendsRes] = await Promise.all([
      fetchSentInvites(),
      fetchReceivedInvites(),
      fetchFriendsList()
    ]);
    if (sentRes.success) setSentInvites(sentRes.data);
    if (receivedRes.success) setReceivedInvites(receivedRes.data);
    if (friendsRes.success) setFriends(friendsRes.data);
  };

  const handleSendInvite = async () => {
    const res = await sendFriendInvite(friendId);
    setOutput(JSON.stringify(res, null, 2));
    loadFriendsData();
  };

  const handleAcceptInvite = async (id: string) => {
    const res = await acceptFriendInvite(id);
    setOutput(JSON.stringify(res, null, 2));
    loadFriendsData();
  };

  const handleRejectInvite = async (id: string) => {
    const res = await rejectFriendInvite(id);
    setOutput(JSON.stringify(res, null, 2));
    loadFriendsData();
  };

  const handleRemoveFriend = async (id: string) => {
    const res = await removeFriend(id);
    setOutput(JSON.stringify(res, null, 2));
    loadFriendsData();
  };

  const handleBlockUser = async (id: string) => {
    const res = await blockUser(id);
    setOutput(JSON.stringify(res, null, 2));
    loadFriendsData();
  };

  useEffect(() => {
    if (user) loadFriendsData();
  }, [user]);

  if (!user) {
    return (
      <div style={{ padding: 20, maxWidth: 400 }}>
        <h2>Connexion / Inscription</h2>
        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} /><br/>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} /><br/>
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} /><br/>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button onClick={handleLogin}>Login</button>
        <button onClick={handleRegister}>Register</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Bienvenue, {user.username}</h2>
      <button onClick={handleLogout}>Logout</button>

      <h3>Ajouter un ami</h3>
      <input placeholder="Friend ID" value={friendId} onChange={e => setFriendId(e.target.value)} />
      <button onClick={handleSendInvite}>Envoyer invitation</button>

      <h3>Invitations reçues</h3>
      <ul>
        {receivedInvites.map(inv => (
          <li key={inv.id}>
            {inv.fromUserId} 
            <button onClick={() => handleAcceptInvite(inv.id)}>Accepter</button>
            <button onClick={() => handleRejectInvite(inv.id)}>Refuser</button>
            <button onClick={() => handleBlockUser(inv.id)}>Bloquer</button>
          </li>
        ))}
      </ul>

      <h3>Invitations envoyées</h3>
      <ul>
        {sentInvites.map(inv => (
          <li key={inv.id}>
            {inv.toUserId}
          </li>
        ))}
      </ul>

      <h3>Liste d'amis</h3>
      <ul>
        {friends.map(f => (
          <li key={f}>
            {f} <button onClick={() => handleRemoveFriend(f)}>Supprimer</button>
          </li>
        ))}
      </ul>

      <h3>Dernière action / réponse API</h3>
      <pre style={{ background: "#222", color: "#0f0", padding: 10 }}>{output}</pre>
    </div>
  );
}
