import React, { useState } from 'react';

function SigninForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [methods, setMethods] = useState<string[]>([]);
  const [profile, setProfile] = useState<any>(null);

  const handleSignin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setMethods([]);
    setProfile(null);

    try {
      const response = await fetch('https://localhost:8443/api/user/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        // credentials: 'include', // 🔥 obligatoire pour envoyer/recevoir les cookies
        // mode: 'cors',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log('Réponse backend:', data);

      // 🔴 Cas 1 : échec d’authentification
      if (!response.ok || data.signinComplete === false) {
        setError(data.message || 'Erreur de connexion');
        return;
      }

      // 🟢 Cas 2 : connexion complète sans 2FA
      if (data.signinComplete === true && data.twoFactorRequired === false) {
        console.log('Connexion réussie, récupération du profil...');
        await fetchUserProfile();
        return;
      }

      // 🟡 Cas 3 : 2FA requise
      if (data.signinComplete === true && data.twoFactorRequired === true) {
        console.log('2FA requise, méthodes disponibles:', data.methodsEnabled);
        setMethods(data.methodsEnabled || []);
        return;
      }

    } catch (err) {
      console.error('Erreur pendant la connexion:', err);
      setError('Une erreur est survenue. Réessaie plus tard.');
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('https://localhost:8443/api/user/profile', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        credentials: 'include', // 🔥 très important : renvoie le cookie access_token
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error('Non autorisé ou erreur serveur');
      }

      const data = await response.json();
      console.log('Profil reçu:', data);
      setProfile(data);
    } catch (err) {
      console.error('Erreur récupération profil:', err);
      setError('Impossible de récupérer le profil');
    }
  };

  const handle2FASelect = (method: string) => {
    // Redirection vers le backend pour initier la 2FA
    window.location.href = `https://localhost:8443/api/user/2fa/${method}`;
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', textAlign: 'center' }}>
      <h2>Connexion</h2>
      <p>Entre ton identifiant et ton mot de passe.</p>

      <form onSubmit={handleSignin}>
        <input
          id="username"
          name="username"
          type="text"
          placeholder="Nom d’utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: '100%', padding: 8, marginBottom: 8 }}
        />

        <input
          id="password"
          name="password"
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: 8 }}
        />

        {/* 🔴 Affichage d'erreur sous le champ mot de passe */}
        {error && (
          <div style={{ color: 'red', marginTop: 5 }}>{error}</div>
        )}

        <button type="submit" style={{ marginTop: 10 }}>
          Se connecter
        </button>
      </form>

      {/* 🟡 Liste des méthodes 2FA */}
      {methods.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h4>Choisis une méthode 2FA :</h4>
          {methods.map((method) => (
            <button
              key={method}
              onClick={() => handle2FASelect(method)}
              style={{ display: 'block', margin: '10px auto', padding: '8px 16px' }}
            >
              {method}
            </button>
          ))}
        </div>
      )}

      {/* 🟢 Profil affiché après connexion */}
      {profile && (
        <div style={{ marginTop: 20 }}>
          <h4>Profil utilisateur :</h4>
          <pre style={{ textAlign: 'left' }}>{JSON.stringify(profile, null, 2)}</pre>
        </div>
      )}

      {/* OAuth */}
      <div style={{ marginTop: 20 }}>
        <a href="https://localhost:8443/api/user/oauth/github/provider">
          <button>Continuer avec GitHub</button>
        </a>
        <a href="https://localhost:8443/api/user/oauth/google/provider">
          <button style={{ marginTop: 10 }}>Continuer avec Google</button>
        </a>
        <a href="https://localhost:8443/api/user/oauth/42/provider">
          <button style={{ marginTop: 10 }}>Continuer avec 42</button>
        </a>
      </div>
    </div>
  );
}

export default SigninForm;
