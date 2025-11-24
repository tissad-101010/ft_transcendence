import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import SignIn from "./components/signIn";
import SignUp from "./components/signUp";
import TwoFactor from "./components/twoFactor";
import { useAuth } from "./context";

import "./styles/authPage.css";

const AuthPage: React.FC = () => {
  const { user, pending2FA, loading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [currentRoute, setCurrentRoute] = useState(window.location.pathname);

  // Écoute des changements de "route" pour simuler navigation sans React Router
  useEffect(() => {
    const handlePop = () => setCurrentRoute(window.location.pathname);
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  // Si l'utilisateur est connecté ou en train de charger → ne rien afficher
  if (user || loading) return null;

  // Détermine quel écran afficher
  const activeKey =  pending2FA?.required
    ? "twofactor"
    : showRegister
    ? "signup"
    : "signin";

  return (
    <div className="authPage-overlay">
      <AnimatePresence mode="wait">
        {activeKey === "twofactor" && (
          <motion.div
            key="twofactor"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <TwoFactor
              methodsEnabled={pending2FA?.methods || []}
              onSuccess={() => {}}

            />
          </motion.div>
        )}

        {activeKey === "signup" && (
          <motion.div
            key="signup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <SignUp onSwitch={() => setShowRegister(false)} />
          </motion.div>
        )}

        {activeKey === "signin" && (
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
