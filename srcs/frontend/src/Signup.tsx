import React, { useState } from 'react';

function SignupForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // prevent the default form submission behavior
    console.log('Signup URL:', 'https://localhost:8443/api');
    try {
      const response = await fetch('https://localhost:8443/api/user/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // indicates that the request body is JSON
          'Accept': 'application/json', // indicates that the client expects a JSON response
          'Origin': 'https://localhost:8443', // uncomment this line if you want to specify the origin
          'Access-Control-Allow-Origin': 'https://localhost:8443', // this header is optional, used for CORS
          'Access-Control-Allow-Credentials': 'true', // this header is optional, used for CORS
          'Authorization': 'Bearer test' // this header is optional, used for authentication if needed
        },
        credentials: 'include', // include cookies in the request
        mode: 'cors', // set the mode to 'cors' to allow cross-origin requests
        body: JSON.stringify({
          username: username,
          password: password,
          email: email,
        }),
      });
      const data = await response.json();
      console.log(data.message); // affiche le message de succès
      console.log('recived data:', data); // affiche les données reçues
      if (response.ok) {
        console.log('registration successful:', data.data);
      } else {
        console.error('registration failed:', data.message);
      }
    } catch (error) {
      console.error('Error during signup:', error);
    }
  };

  return (
    <div>
      <h2>Signup</h2>
      <p>Enter your details to create an account.</p>
    <form onSubmit={handleSignup}>
      <input
        id ="username"
        name="username"
        type="text"
        placeholder="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <br />
      <br />
      <input
        id="email"
        name="email"
        type="email"
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
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
      <button type="submit">S'inscrire</button>
    </form>
          <div id ="Oauth-github">
        <a href="https://localhost:8443/api/user/oauth/github">
          <button type="button" style={{ marginTop: 10 }}>
            continuer avec GitHub
          </button>
        </a>
      </div>
      <div id ="Oauth-google">
        <a href="https://localhost:8443/api/user/oauth/google">
          <button type="button" style={{ marginTop: 10 }}>
            continuer avec Google
          </button>
        </a>
      </div>
      <div id ="Oauth-42">
        <a href="https://localhost:8443/api/user/oauth/42">
          <button type="button" style={{ marginTop: 10 }}>
            continuer avec 42
          </button>
        </a>
      </div>
    </div>
  );
}

export default SignupForm;
