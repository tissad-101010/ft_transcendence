// src/auth/components/TwoFactor.tsx
import React, { useState } from "react";
import {
  sendEmailOtp,
  verifyEmailOtp,
  verifyTotp,
} from "../controllers/twoFactor.api";
import { TwoFactorMethod  } from "../types/auth.types";

interface TwoFactorProps {
  methodsEnabled: TwoFactorMethod [];
  onSuccess: () => void;
}

const TwoFactor: React.FC<TwoFactorProps> = ({ methodsEnabled, onSuccess }) => {
  const [selectedMethod, setSelectedMethod] = useState<TwoFactorMethod  | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSelectMethod = async (method: TwoFactorMethod ) => {
    setSelectedMethod(method);
    setError("");
    setMessage("");

    if (method === "EMAIL") {
      const ok = await sendEmailOtp();
      if (ok) setMessage("A verification code was sent to your email.");
      else setError("Failed to send verification email.");
    } else if (method === "TOTP") {
      setMessage("Enter the code from your authenticator app.");
    }
  };

  const handleVerify = async () => {
    if (!selectedMethod || !code) {
      setError("Please select a method and enter your code.");
      return;
    }

    let success = false;
    if (selectedMethod === "EMAIL") {
      success = await verifyEmailOtp(code);
    } else if (selectedMethod === "TOTP") {
      success = await verifyTotp(code);
    }

    if (success) {
      setMessage("✅ 2FA verification successful!");
      onSuccess();
    } else {
      setError("Invalid code. Please try again.");
    }
  };

  return (
    <div className="authPage-window">
      <img
        src="/logoWhite.png"
        alt="Logo"
        style={{ width: 80, height: 80, marginBottom: 20 }}
      />
      <h1>Two-Factor Authentication</h1>

      {!selectedMethod ? (
        <>
          <p style={{ marginBottom: 20 }}>Select a verification method:</p>
          {methodsEnabled.map((method) => (
            <button
              key={method}
              className="authPage-button"
              style={{ width: "60%" }}
              onClick={() => handleSelectMethod(method)}
            >
              {method === "EMAIL" ? "Email" : "Authenticator App"}
            </button>
          ))}
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

          <button
            className="guest-button"
            onClick={() => setSelectedMethod(null)}
          >
            ← Back
          </button>
        </>
      )}
    </div>
  );
};

export default TwoFactor;
