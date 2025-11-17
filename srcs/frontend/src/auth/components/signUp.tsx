import React, { useState } from "react";
import { registerUser } from "../controllers/auth.api";
interface SignUpProps {
  onSwitch: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSwitch }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");


  const handleRegister = async () => {
    try {
      const result = await registerUser(username, email, password);
      if (result.success) {
        onSwitch(); // retourne vers le login
      } else {
        setErrorMessage(result.message ?? "Registration failed");
      }
    } catch {
      setErrorMessage("Network error during registration");
    }
  };

  
  return (
    <div className="authPage-window">
      <img src="/logoWhite.png" alt="Logo" style={{ width: 80, height: 80, marginBottom: 20 }} />
      <h1>Create your account</h1>

      <div className="authPage-input-container">
        <label>Username</label>
        <input type="text" onChange={(e) => setUsername(e.target.value)} />
      </div>

      <div className="authPage-input-container">
        <label>Email</label>
        <input type="email" onChange={(e) => setEmail(e.target.value)} />
      </div>

      <div className="authPage-input-container">
        <label>Password</label>
        <input type="password" onChange={(e) => setPassword(e.target.value)} />
      </div>

      {errorMessage && <p className="error">{errorMessage}</p>}

      <button className="authPage-button" onClick={handleRegister}>
        Sign Up
      </button>

      <p>
        Already have an account?{" "}
        <a href="#signin" onClick={onSwitch}>
          Sign in
        </a>
      </p>

      {/* <div className="authPage-logos">
        <img src="/google-logo.png" alt="Google" className="logo" onClick={() => handleOAuth("google")} />
        <img src="/github-logo.png" alt="Github" className="logo" onClick={() => handleOAuth("github")} />
        <img src="/42-logo.png" alt="42" className="logo" onClick={() => handleOAuth("42")} />
      </div> */}
    </div>
  );
};

export default SignUp;
