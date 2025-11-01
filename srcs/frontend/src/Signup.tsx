import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // pour rediriger après succès

function SignupForm() {
  const navigate = useNavigate();

  // champs du formulaire
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  // gestion des erreurs
  const [errors, setErrors] = useState({
    emailFormat: '',
    usernameFormat: '',
    passwordFormat: '',
  });

  const [generalError, setGeneralError] = useState('');

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneralError('');
    setErrors({ emailFormat: '', usernameFormat: '', passwordFormat: '' });

    try {
      const response = await fetch('https://localhost:8443/api/user/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({ username, password, email }),
      });

      const data = await response.json();
      console.log('Received data:', data);

      // cas succès
      if (data.signupComplete === true) {
        console.log('Signup successful');
        navigate('/signin'); // redirection vers la page de connexion
        return;
      }

      // cas erreurs connues
      if (data.signupComplete === false) {
        if (data.errors && data.errors.errors) {
          // erreurs de format côté backend
          setErrors({
            emailFormat: data.errors.errors.emailFormat || '',
            usernameFormat: data.errors.errors.usernameFormat || '',
            passwordFormat: data.errors.errors.passwordFormat || '',
          });
        } else if (data.message) {
          // message d'erreur global
          setGeneralError(data.message);
        } else {
          setGeneralError('Une erreur inconnue est survenue.');
        }
      }
    } catch (error) {
      console.error('Error during signup:', error);
      setGeneralError("Erreur réseau ou serveur injoignable.");
    }
  };

  return (
    <div>
      <h2>Signup</h2>
      <p>Enter your details to create an account.</p>

      <form onSubmit={handleSignup} noValidate>
        <div style={{ marginBottom: 16 }}>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="Nom d'utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          {errors.usernameFormat && (
            <p style={{ color: 'red', fontSize: 12 }}>{errors.usernameFormat}</p>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.emailFormat && (
            <p style={{ color: 'red', fontSize: 12 }}>{errors.emailFormat}</p>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.passwordFormat && (
            <p style={{ color: 'red', fontSize: 12 }}>{errors.passwordFormat}</p>
          )}
        </div>

        {generalError && (
          <p style={{ color: 'red', fontWeight: 'bold' }}>{generalError}</p>
        )}

        <button type="submit">S'inscrire</button>
      </form>

      <div style={{ marginTop: 20 }}>
        <a href="https://localhost:8443/api/user/oauth/github/provider">
          <button type="button" style={{ marginTop: 10 }}>
            Continuer avec GitHub
          </button>
        </a>
        <a href="https://localhost:8443/api/user/oauth/google/provider">
          <button type="button" style={{ marginTop: 10 }}>
            Continuer avec Google
          </button>
        </a>
        <a href="https://localhost:8443/api/user/oauth/42/provider">
          <button type="button" style={{ marginTop: 10 }}>
            Continuer avec 42
          </button>
        </a>
      </div>
    </div>
  );
}

export default SignupForm;
