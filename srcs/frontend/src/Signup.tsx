import React, { useState } from 'react';

function SignupForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // empêche le rechargement de la page
    console.log('Signup URL:', 'https://localhost:8443/api');
    try {
      const response = await fetch('https://localhost:8443/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // indique qu'on envoie du JSON
          'Authorization': 'Bearer test' // déclenche préflight
        },
        credentials: 'include', // permet d'envoyer les cookies avec la requête
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });
      const data = await response.json();
      console.log(data.message); // affiche le message de succès
      console.log('Données reçues:', data.data); // affiche les données reçues
      if (response.ok) {
        console.log('Inscription réussie pour:', data.data.username);
      } else {
        console.error('Erreur lors de l’inscription:', data.message);
      }
      console.log(data);

    } catch (error) {
      console.error('Erreur lors du signup:', error);
    }
  };

  return (
    <form onSubmit={handleSignup}>
      <input
        type="text"
        placeholder="Nom d'utilisateur"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">S'inscrire</button>
    </form>
  );
}

export default SignupForm;
