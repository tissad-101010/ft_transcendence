import React, { useState } from 'react';

function SigninForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSignin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // empêche le rechargement de la page
    console.log('Signin URL:', 'https://localhost:8443/api');
    try {
      const response = await fetch('https://localhost:8443/api/user/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'https://localhost:8443',
          'Access-Control-Allow-Origin': 'https://localhost:8443',
          'Access-Control-Allow-Credentials': 'true',
          'Authorization': 'Bearer test'
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const data = await response.json();
      console.log(data.message); // message de succès ou d'erreur
      console.log('received data:', data.data);

      if (response.ok) {
        console.log('login successful:', data.data);
        // tu peux stocker le token ou rediriger l’utilisateur ici
      } else {
        console.error('login failed:', data.message);
      }
    } catch (error) {
      console.error('Error during signin:', error);
    }
  };

  return (
    <div>
      <h2>Sign In</h2>
      <p>Enter your credentials to access your account.</p>
      <form onSubmit={handleSignin}>
        <input
          id="username"
          name="username"
          type="text"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <br />
        <br />
        <input
          id="password"
          name="password"
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <br />
        <button type="submit">Se connecter</button>
      </form>
      <div id ="Oauth-github">
        <a href="https://localhost:8443/api/auth/github">
          <button type="button" style={{ marginTop: 10 }}>
            continuer avec GitHub
          </button>
        </a>
      </div>
      <div id ="Oauth-google">
        <a href="https://localhost:8443/api/auth/google">
          <button type="button" style={{ marginTop: 10 }}>
            continuer avec Google
          </button>
        </a>
      </div>
    </div>
  );
}

export default SigninForm;
