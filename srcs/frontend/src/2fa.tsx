import React, { useState, useEffect } from 'react';



declare global {
  interface Window {
    grecaptcha: any;
  }
}

function TwoFactorAuthV2() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  // Envoyer OTP par email
  const sendEmailOtp = async () => {
    if (!email) return alert('Veuillez saisir votre e-mail');
    try {
      const response = await fetch('https://localhost:8443/api/otp/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer test',
        },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) console.log('OTP email envoyé ✅', data.message);
      else console.error('Erreur OTP email ❌', data.message);
    } catch (err) {
      console.error('Erreur envoi OTP email ❌', err);
    }
  };



  // Vérification OTP
  const verifyOtp = async () => {
    if (!otp) return alert('Veuillez saisir le code OTP');
    try {
      const response = await fetch('https://localhost:8443/api/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer test',
        },
        credentials: 'include',
        body: JSON.stringify({ email: email || undefined, otp }),
      });
      const data = await response.json();
      if (response.ok) console.log('OTP vérifié ✅', data.message);
      else console.error('OTP vérification échouée ❌', data.message);
    } catch (err) {
      console.error('Erreur vérification OTP ❌', err);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      <h2>Vérification par OTP</h2>
      <p>Entrez votre e-mail ou numéro de téléphone pour recevoir un code OTP.</p>

      {/* Email */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="email"
          placeholder="Adresse e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: 8 }}
        />
        <br />
        <button type="button" onClick={sendEmailOtp} style={{ marginTop: 10 }}>
          Envoyer OTP par e-mail
        </button>
      </div>


      {/* Vérification OTP */}
      <div>
        <input
          type="text"
          placeholder="Code OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          style={{ width: '100%', padding: 8 }}
        />
        <br />
        <button type="button" onClick={verifyOtp} style={{ marginTop: 10 }}>
          Vérifier le code OTP
        </button>
      </div>
  </div>
  );
}

export default TwoFactorAuthV2;
