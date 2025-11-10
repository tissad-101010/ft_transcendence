import React, { useState } from "react";
import "./HomePage.css";


// Fonction externe pour gérer l'inscription
async function registerUser(
  username: string,
  email: string,
  password: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch("https://localhost:8443/api/user/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include", // envoie les cookies si backend les utilise
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (response.ok && data.signupComplete) {
      return { success: true };
    } else {
      return { success: false, message: data.message || "Registration failed" };
    }
  } catch (err) {
    console.error(err);
    return { success: false, message: "An error occurred during registration" };
  }
}

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

            <button className="homepage-button" onClick={handleRegister}>Register</button>

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
