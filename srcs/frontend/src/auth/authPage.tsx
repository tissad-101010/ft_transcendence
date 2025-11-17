import React, { useState } from "react";
import SignIn from "./components/signIn";
import SignUp from "./components/signUp";
import TwoFactor from "./components/twoFactor";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "./context";
import "./styles/authPage.css";

const AuthPage: React.FC = () => {
  const [showRegister, setShowRegister] = useState(false);
  const { user, pending2FA, loading } = useAuth();

  // Si l'utilisateur est déjà connecté → on ne rend pas la page d’authentification
  if (user) return null;
  if (loading) return null;
  // si l'état 2FA n'est pas requis → ne rien afficher (a tester/!\)
  if (pending2FA && !pending2FA.required) return null;


  // Détermine quel écran afficher :
  // - Si 2FA est requis → affiche TwoFactor
  // - Sinon → affiche SignIn ou SignUp selon l’état
  const activeKey = pending2FA?.required
    ? "twofactor"
    : showRegister
    ? "signup"
    : "signin";

  return (
    <div className="authPage-overlay">
      <AnimatePresence mode="wait">
        {activeKey === "twofactor" ? (
          <motion.div
            key="twofactor"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <TwoFactor
              methodsEnabled={pending2FA?.required ? pending2FA.methods : []}
              onSuccess={() => {}}
            />
          </motion.div>
        ) : activeKey === "signup" ? (
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
