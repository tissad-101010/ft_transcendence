import React, { useState } from "react";
import {
  sendEmailOtp,
  verifyEmailOtp,
  verifyTotp,
} from "../controllers/twoFactor.api";
import { TwoFactorMethod } from "../types/auth.types";

import { useAuth } from "../context";

import { fetchUserProfile } from "../controllers/auth.api";

interface TwoFactorProps {
  methodsEnabled: TwoFactorMethod[]; 
  onSuccess: () => void;
}

const TwoFactor: React.FC<TwoFactorProps> = ({ methodsEnabled, onSuccess }) => {
  const [selectedMethod, setSelectedMethod] = useState<TwoFactorMethod | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const { login, setPending2FA } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const { resetPending2FA } = useAuth();


  const handleLogin = async () => {
    try {
        // Pas de 2FA → on récupère le profile et on login direct
        const profile = await fetchUserProfile();
        if (profile.success && profile.data) {
          login(profile.data);  // <-- passe l'objet user dans le context
      } else {
        setError( "Login failed");
      }
    } catch (err) {
      console.error(err);
      setError("Network error during login");
    }
  };

  const handleSelectMethod = async (method: TwoFactorMethod) => {
    setSelectedMethod(method);
    setError("");
    setMessage("");

    if (method.type === "EMAIL") {
      const ok = await sendEmailOtp();
      if (ok) setMessage("A verification code was sent to your email.");
      else setError("Failed to send verification email.");
    }

    if (method.type === "TOTP") {
      setMessage("Enter the code from your authenticator app.");
    }
  };

  const handleVerify = async () => {
    if (!selectedMethod || !code) {
      setError("Please select a method and enter your code.");
      return;
    }

    let success = false;

    if (selectedMethod.type === "EMAIL") {
      success = await verifyEmailOtp(code);
    }

    if (selectedMethod.type === "TOTP") {
      success = await verifyTotp(code);
    }

    if (success) {
      setMessage("✅ 2FA verification successful!");
      await handleLogin();
      onSuccess();
    } else {
      setError("Invalid code. Please try again.");
    }
  };


  return (
    <div className="authPage-window">
      <img src="/logoWhite.png" alt="Logo" style={{ width: 80, height: 80, marginBottom: 20 }} />
      <h1>Two-Factor Authentication</h1>

      {!selectedMethod ? (
        <>
          <p>Select a verification method:</p>

          {methodsEnabled
            .filter((m) => m.enabled)
            .map((method) => (
              <button
                key={method.id}
                className="authPage-button"
                style={{ width: "60%" }}
                onClick={() => handleSelectMethod(method)}
              >
                {method.type === "EMAIL" ? "Email" : "Authenticator App"}
              </button>
            ))}
          {/* back  */}
          <button className="guest-button" onClick={() => resetPending2FA()}>
            ← Back
          </button>
        </>
      ) : (
        <>
          <p>{message}</p>

          <div className="authPage-input-container">
            <label>Enter your 2FA code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="6-digit code"
            />
          </div>

          {error && <p className="error">{error}</p>}

          <button className="authPage-button" onClick={handleVerify}>
            Verify Code
          </button>

          <button className="guest-button" onClick={() => setSelectedMethod(null)}>
            ← Back
          </button>
        </>
      )}
    </div>
  );
};

export default TwoFactor;
