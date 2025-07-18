import React from 'react';
import { useState } from 'react';
import BabylonScene from './BabylonScene.tsx';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignupForm from './Signup.tsx';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BabylonScene />} />
        <Route path="/signup" element={<SignupForm />} />
      </Routes>
    </Router>
  );
}

export default App;
