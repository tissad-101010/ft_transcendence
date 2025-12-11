/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   App.tsx                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/12/11 17:53:50 by tissad            #+#    #+#             */
/*   Updated: 2025/12/11 17:53:51 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import BabylonScene from "./BabylonScene.tsx";
import AuthPage from "./auth/authPage.tsx";
import { AuthProvider, useAuth } from "./auth/context.tsx";
import { Routes, Route } from "react-router-dom";
import OAuthCallback from "./OAuthCallback.tsx";
function MainApp() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Babylon Scene */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
      >
        <BabylonScene />
      </div>

      {/* Overlay AuthPage */}
      {!isAuthenticated && (
        <div 
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 10,
          }}
        >
          <AuthPage />
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (

    <Routes>

      {/* Page principale : ton layout actuel */}
      <Route path="/" element={  <AuthProvider><MainApp /> </AuthProvider>} />

      {/* Callback OAuth: pas d’overlay, pas de Babylon, juste le flow OAuth */}
      <Route path="/oauth/callback" element={<AuthProvider><OAuthCallback /></AuthProvider>} />

    </Routes>
  );
}
