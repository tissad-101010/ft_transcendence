import React, { useState } from 'react';

declare global {
  interface Window {
    grecaptcha: any;
  }
}

function TwoFactorAuthV2() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [totp, setTotp] = useState('');
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);

  // === OTP par e-mail ===
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
      if (response.ok) alert('OTP envoyé ✅');
      else alert(`Erreur OTP email ❌: ${data.message}`);
    } catch (err) {
      console.error('Erreur envoi OTP email ❌', err);
    }
  };

  const verifyOtp = async () => {
    if (!otp) return alert('Veuillez saisir le code OTP');
    try {
      const response = await fetch('https://localhost:8443/api/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer test',
        },
        credentials: 'include',
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      if (response.ok) alert('OTP vérifié ✅');
      else alert(`OTP invalide ❌: ${data.message}`);
    } catch (err) {
      console.error('Erreur vérification OTP ❌', err);
    }
  };

  // === Google Authenticator (TOTP) ===
  const enableGoogleAuth = async () => {
    try {
      const response = await fetch('https://localhost:8443/api/2fa/enable-tfa', {
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
      if (response.ok && data.qrCodeUrl) {
        console.log('QR Code URL reçu ✅:', data.qrCodeUrl);
        setQrCodeUrl(data.qrCodeUrl.qrCodeUrl);

        alert('Scannez le QR Code avec Google Authenticator');
      } else {
        alert(`Erreur génération QRCode ❌: ${data.message}`);
      }
    } catch (err) {
      console.error('Erreur activation Google Authenticator ❌', err);
    }
  };

  const verifyGoogleAuth = async () => {
    if (!totp) return alert('Veuillez saisir le code TOTP à 6 chiffres');
    try {
      const response = await fetch('https://localhost:8443/api/2fa/google/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer test',
        },
        credentials: 'include',
        body: JSON.stringify({ email, code: totp }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('TOTP vérifié ✅');
        setTwoFaEnabled(true);
      } else {
        alert(`TOTP invalide ❌: ${data.message}`);
      }
    } catch (err) {
      console.error('Erreur vérification TOTP ❌', err);
    }
  };

  const disableGoogleAuth = async () => {
    try {
      const response = await fetch('https://localhost:8443/api/2fa/google/disable', {
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
      if (response.ok) {
        alert('2FA désactivée ❌');
        setTwoFaEnabled(false);
        setQrCodeUrl('');
      } else {
        alert(`Erreur désactivation ❌: ${data.message}`);
      }
    } catch (err) {
      console.error('Erreur désactivation Google Auth ❌', err);
    }
  };

  return (
    <div style={{ maxWidth: 450, margin: 'auto', padding: 20 }}>
      <h2>Test 2FA : OTP & Google Authenticator</h2>

      {/* Email */}
      <div style={{ marginBottom: 25 }}>
        <h3>🔐 Authentification par e-mail</h3>
        <input
          type="email"
          placeholder="Adresse e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: 8 }}
        />
        <button onClick={sendEmailOtp} style={{ marginTop: 10 }}>Envoyer OTP</button>
        <input
          type="text"
          placeholder="Code OTP reçu"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          style={{ width: '100%', padding: 8, marginTop: 10 }}
        />
        <button onClick={verifyOtp} style={{ marginTop: 10 }}>Vérifier OTP</button>
      </div>

      <hr />

      {/* Google Authenticator */}
      <div>
        <h3>📱 Google Authenticator</h3>
        {!twoFaEnabled ? (
          <>
            <button onClick={enableGoogleAuth}>Activer Google Authenticator</button>
            {qrCodeUrl && (
              <div style={{ marginTop: 10 }}>
                <p>Scannez ce QR Code dans votre application Google Authenticator :</p>
                <img src={qrCodeUrl} alt="QR Code" style={{ width: 200, height: 200 }} />
              </div>
            )}
            <input
              type="text"
              placeholder="Code à 6 chiffres"
              value={totp}
              onChange={(e) => setTotp(e.target.value)}
              style={{ width: '100%', padding: 8, marginTop: 10 }}
            />
            <button onClick={verifyGoogleAuth} style={{ marginTop: 10 }}>
              Vérifier TOTP
            </button>
          </>
        ) : (
          <div>
            <p>✅ 2FA activée pour {email}</p>
            <button onClick={disableGoogleAuth}>Désactiver</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TwoFactorAuthV2;
