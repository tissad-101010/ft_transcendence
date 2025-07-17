import React from 'react';
import { useState } from 'react';
import BabylonScene from './BabylonScene.tsx';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Hello from './Singup.tsx';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BabylonScene />} />
        <Route path="/Singup" element={<Hello />} />
      </Routes>
    </Router>
  );
}

export default App;
