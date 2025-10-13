import React, { useState } from 'react';

function OtpVerification() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  const sendEmailOtp = async () => {
    console.log('Sending OTP to email:', email);
    try {
      const response = await fetch('https://localhost:8443/api/otp/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer test'
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log('OTP sent to email successfully:', data.message);
      } else {
        console.error('Failed to send OTP to email:', data.message);
      }
    } catch (error) {
      console.error('Error while sending email OTP:', error);
    }
  };

  const sendPhoneOtp = async () => {
    console.log('Sending OTP to phone:', phone);
    try {
      const response = await fetch('https://localhost:8443/api/otp/phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer test'
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({ phone }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log('OTP sent to phone successfully:', data.message);
      } else {
        console.error('Failed to send OTP to phone:', data.message);
      }
    } catch (error) {
      console.error('Error while sending phone OTP:', error);
    }
  };

  const verifyOtp = async () => {

    console.log('Verifying OTP:', otp);
    console.log('For email:', email);
    try {
      const response = await fetch('https://localhost:8443/api/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer test'
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({ 
          email: email || undefined,
          otp : otp }
        ),
      });
      const data = await response.json();
      if (response.ok) {
        console.log('OTP verified successfully:', data.message);
      } else {
        console.error('OTP verification failed:', data.message);
      }
    } catch (error) {
      console.error('Error while verifying OTP:', error);
    }
  };

  return (
    <div>
      <h2>Vérification par OTP</h2>
      <p>Entrez votre adresse e-mail ou votre numéro de téléphone pour recevoir un code OTP.</p>

      {/* Email */}
      <div>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Adresse e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br /><br />
        <button type="button" onClick={sendEmailOtp}>Envoyer OTP à l’e-mail</button>
      </div>

      <br />

      {/* Téléphone */}
      <div>
        <input
          id="phone"
          name="phone"
          type="tel"
          placeholder="Numéro de téléphone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <br /><br />
        <button type="button" onClick={sendPhoneOtp}>Envoyer OTP au téléphone</button>
      </div>

      <br />

      {/* Vérification du code OTP */}
      <div>
        <input
          id="otp"
          name="otp"
          type="text"
          placeholder="Code OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <br /><br />
        <button type="button" onClick={verifyOtp}>Vérifier le code OTP</button>
      </div>
    </div>
  );
}

export default OtpVerification;
