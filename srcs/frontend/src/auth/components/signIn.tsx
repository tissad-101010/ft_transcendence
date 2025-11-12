import React, { useState } from "react";
import { loginUser, fetchUserProfile } from "../controllers/auth.api";
import { providerOAuth } from "../controllers/oauth.api";
import { useAuth } from "../context";

interface SignInProps {
  onSwitch: () => void;
}

const SignIn: React.FC<SignInProps> = ({ onSwitch }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { login } = useAuth(); // Récupère la fonction login du contexte

  const handleLogin = async () => {
    try {
      const result = await loginUser(username, password);
      if (result.success) {
        const profile = await fetchUserProfile();
        if (profile.success && profile.data) {
          login(profile.data); // met à jour le contexte global
        } else {
          setErrorMessage("Unable to fetch user profile.");
        }
      } else {
        setErrorMessage(result.message ?? "Login failed");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Network error during login");
    }
  };
  const handleOAuth = async (provider: string) => {
    try {
      await providerOAuth(provider);
      const profile = await fetchUserProfile();
      if (profile.success && profile.data) {
        login(profile.data); // met à jour le contexte global
      } else {
        setErrorMessage("Unable to fetch user profile.");
      }   
    } catch (err) {
      console.error("An error occurred during OAuth initiation:", err);
    }
  };
  return (
    <div className="authPage-window">
      <img
        src="/logoWhite.png"
        alt="Logo"
        style={{ width: 80, height: 80, marginBottom: 20 }}
      />
      <h1>Sign in to Moonset</h1>

      <div className="authPage-input-container">
        <label>Username or Email</label>
        <input
          type="text"
          onChange={(e) => setUsername(e.target.value)}
          value={username}
        />
      </div>

      <div className="authPage-input-container">
        <label>Password</label>
        <input
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />
      </div>

      {errorMessage && <p className="error">{errorMessage}</p>}

      <button className="authPage-button" onClick={handleLogin}>
        Sign In
      </button>

      <div className="authPage-logos">
        <img
          src="/google-logo.png"
          alt="Google"
          className="logo"
          onClick={() => handleOAuth("google")}
        />
        <img
          src="/github-logo.png"
          alt="Github"
          className="logo"
          onClick={() => handleOAuth("github")}
        />
        <img
          src="/42-logo.png"
          alt="42"
          className="logo"
          onClick={() => handleOAuth("42")}
        />
      </div>

      <p>
        New to Moonset?{" "}
        <a href="#" onClick={onSwitch}>
          Create an account
        </a>
      </p>
    </div>
  );
};

export default SignIn;