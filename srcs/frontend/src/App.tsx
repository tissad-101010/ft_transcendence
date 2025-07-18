import React from 'react';
import { useState } from 'react';
import BabylonScene from './BabylonScene.tsx';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignupForm from './Signup.tsx';
import './App.css';
import { Link } from 'react-router-dom';

function App() {
  return (
    <Router>
      <nav>
        <Link to="/">Accueil</Link>
        <Link to="/signup">S'inscrire</Link>
      </nav>

      <Routes>
        <Route path="/" element={<BabylonScene />} />
        <Route path="/signup" element={<SignupForm />} />
      </Routes>
    </Router>
  );
}

export default App;
