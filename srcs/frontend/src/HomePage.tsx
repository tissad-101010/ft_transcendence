import React, { use, useState } from "react";
import {registerUser,
  loginUser,
  fetchUserProfile
} from "./auth/controllers/auth.api.ts";

import { handleOAuth } from "./auth/controllers/oauth.api.ts";

import "./HomePage.css";


// Fonction externe pour gérer l'inscription


const HomePage = () => {
  // État pour savoir si on affiche le formulaire d'inscription
  const [showRegister, setShowRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegister = async () => {
    const result = await registerUser(username, email, password);
    if (result.success) {
      setShowRegister(false);
    } else {
      setErrorMessage(result.message??"Registration failed");
    }
  };
  const handleLogin = async () => {
    const result = await loginUser(username, password);
    if (result.success) {
      // Rediriger ou mettre à jour l'état de l'application après une connexion réussie
      console.log("Login successful");
      // Vous pouvez rediriger l'utilisateur ou mettre à jour l'état de l'application ici
      const userProfile =  await fetchUserProfile();
      if (userProfile.success) {
        console.log("User Profile:", userProfile);
      }
      else {
        console.log("Failed to fetch user profile:", userProfile.message);
      }
    }
    else {
      setErrorMessage(result.message??"Login failed");
    }
  };

  return (
    <div className="homepage-overlay">
      <div className="homepage-window">

        <img src="/logoWhite.png" alt="Logo" style={{ width: 80, height: 80, marginBottom: 20 }} />
        {showRegister ? (
          // === Formulaire d'inscription ===
          <>
            <h1 style={{ color: "white", textAlign: "center" }}>Create your account</h1>

            <div className="homepage-input-container">
              <label>Username</label>
              <input  type="text" onChange={(e) => setUsername(e.target.value)} />
            </div>

            <div className="homepage-input-container">
              <label>Email</label>
              <input type="email" onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="homepage-input-container">
              <label>Password</label>
              <input type="password" onChange={(e) => setPassword(e.target.value)} />
            </div>

            <button className="homepage-button" onClick={handleRegister}>Sign Up</button>

            <div className="Register">
              <p>
                Already have an account? {"  "}
                <a href="#" onClick={() => setShowRegister(false)}> Sign in</a>
              </p>
            </div>

            <div className="homepage-logos">
              {/* send request to backend to handle oauth */}
              <img src="/google-logo.png" alt="Google" className="logo" onClick={() => handleOAuth("google")} />
              <img src="/github-logo.png" alt="Github" className="logo" onClick={() => handleOAuth("github")} />
              <img src="/42-logo.png" alt="42" className="logo" onClick={() => handleOAuth("42")} />
            </div>
          </>
        ) : (
          
          // === Formulaire de login ===
          <>
            <h1 style={{ color: "white", textAlign: "center" }}> Sign in to Moonset</h1>
            <div className="homepage-input-container">
              <label>Username or Email</label>
              <input type="text" onChange={(e) => setUsername(e.target.value)} />
            </div>

            <div className="homepage-input-container">
              <div className="homepage-label-row">
                <label>Password</label>
                <a href="#" className="forget-password">Forget Password?</a>
              </div>
              <input type="password" onChange={(e) => setPassword(e.target.value)} />
            </div>

            <button className="homepage-button" onClick={handleLogin}>Sign In</button>

            <div className="homepage-logos">
              <img src="/google-logo.png" alt="Google" className="logo" />
              <img src="/github-logo.png" alt="Github" className="logo" />
              <img src="/42-logo.png" alt="42" className="logo" />
            </div>

            <div className="Register">
              <p>
                New to Moonset?{"  "}
                <a href="#" onClick={() => setShowRegister(true)}> Create an account</a>
              </p>
            </div>

            <button className="guest-button">Play as guest</button>
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
