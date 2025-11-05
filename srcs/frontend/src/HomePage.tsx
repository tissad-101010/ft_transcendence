import React, { useState } from "react";
import "./HomePage.css";

const HomePage = () => {
  // État pour savoir si on affiche le formulaire d'inscription
  const [showRegister, setShowRegister] = useState(false);

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
              <input type="text" />
            </div>

            <div className="homepage-input-container">
              <label>Email</label>
              <input type="email" />
            </div>

            <div className="homepage-input-container">
              <label>Password</label>
              <input type="password" />
            </div>

            <button className="homepage-button">Register</button>

            <div className="Register">
              <p>
                Already have an account? {"  "}
                <a href="#" onClick={() => setShowRegister(false)}> Sign in</a>
              </p>
            </div>

            <div className="homepage-logos">
              <img src="/google-logo.png" alt="Google" className="logo" />
              <img src="/github-logo.png" alt="Github" className="logo" />
              <img src="/42-logo.png" alt="42" className="logo" />
            </div>
          </>
        ) : (
          
          // === Formulaire de login ===
          <>
            <h1 style={{ color: "white", textAlign: "center" }}> Sign in to Moonset</h1>
            <div className="homepage-input-container">
              <label>Username or Email</label>
              <input type="text" />
            </div>

            <div className="homepage-input-container">
              <div className="homepage-label-row">
                <label>Password</label>
                <a href="#" className="forget-password">Forget Password?</a>
              </div>
              <input type="password" />
            </div>

            <button className="homepage-button">Sign In</button>

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
