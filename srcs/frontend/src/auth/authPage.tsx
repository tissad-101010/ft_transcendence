import React, { useState } from "react";
import SignIn from "./components/signIn";
import SignUp from "./components/signUp";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "./context";
import "./styles/authPage.css";

const AuthPage: React.FC = () => {
  const [showRegister, setShowRegister] = useState(false);
const { isAuthenticated: user } = useAuth();

  // Si user connecté → on ne rend plus la page d’auth
  if (user) return null;

  return (
    <div className="authPage-overlay">
      <AnimatePresence mode="wait">
        {showRegister ? (
          <motion.div
            key="signup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <SignUp onSwitch={() => setShowRegister(false)} />
          </motion.div>
        ) : (
          <motion.div
            key="signin"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <SignIn onSwitch={() => setShowRegister(true)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuthPage;
