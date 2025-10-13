import React from 'react';
import { useState } from 'react';
import BabylonScene from './BabylonScene.tsx';
import Chat from './Chat.tsx';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignupForm from './Signup.tsx';
import SigninForm from './Signin.tsx';
import './App.css';
import { Link } from 'react-router-dom';



const Scene: React.FC = () => {
  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden" }}>
      <BabylonScene />
      <Chat />
    </div>
  );
};



function App() {
  return (
    <Router>
      <nav>
        <Link to="/">Accueil </Link>
        <Link to="/signup">S'inscrire </Link>
        <Link to="/signin">Se connecter</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Scene />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/signin" element={<SigninForm />} />
      </Routes>
    </Router>
  );
}

export default App;
