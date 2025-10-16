import React, { useState, useEffect } from 'react';



declare global {
  interface Window {
    grecaptcha: any;
  }
}

function TwoFactorAuthV2() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [captchaReady, setCaptchaReady] = useState(false);

  // Charger le script reCAPTCHA v2
  useEffect(() => {
    console.log('RECAPTCHA_SITE_KEY =', process.env.RECAPTCHA_SITE_KEY);

    const scriptId = 'recaptcha-script-v2';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://www.google.com/recaptcha/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('reCAPTCHA script chargé ✅');
        setCaptchaReady(true);
      };
      document.body.appendChild(script);
    }
  }, []);

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

  // Envoyer OTP par téléphone
  const sendPhoneOtp = async () => {
    if (!phone) return alert('Veuillez saisir votre numéro de téléphone');
    if (!captchaReady) return console.error('reCAPTCHA non chargé');

    // Vérifie que le widget est prêt
    if (!window.grecaptcha || !window.grecaptcha.getResponse) {
      return console.error('reCAPTCHA widget non prêt');
    }

    const recaptchaToken = window.grecaptcha.getResponse();
    if (!recaptchaToken) return alert('Veuillez compléter le CAPTCHA');

    console.log('Token reCAPTCHA v2:', recaptchaToken);

    try {
      const response = await fetch('https://localhost:8443/api/otp/phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer test',
          'x-recaptcha-token': recaptchaToken,
        },
        credentials: 'include',
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();
      if (response.ok) console.log('OTP téléphone envoyé ✅', data.message);
      else console.error('Erreur OTP téléphone ❌', data.message);

      // Reset le CAPTCHA après envoi
      window.grecaptcha.reset();
    } catch (err) {
      console.error('Erreur envoi OTP téléphone ❌', err);
      window.grecaptcha.reset();
    }
  };

  // Vérification OTP
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

      {/* Téléphone */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="tel"
          placeholder="Numéro de téléphone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ width: '100%', padding: 8 }}
        />

        {/* reCAPTCHA v2 widget */}
        <div style={{ margin: '10px 0' }}>
          <div
            className="g-recaptcha"
            data-sitekey="your-site-key-here"
          ></div>
        </div>

        <button type="button" onClick={sendPhoneOtp} style={{ marginTop: 10 }}>
          Envoyer OTP par téléphone
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
