import React from "react";
import BabylonScene from "./BabylonScene.tsx";
import AuthPage from "./auth/authPage.tsx";

import ApiTester from "./testApiFriend.tsx";

import { AuthProvider, useAuth } from "./auth/context.tsx";

function MainApp() {
  const { isAuthenticated } = useAuth();

  return (
    // <div className="relative w-full h-screen overflow-hidden">
    //   {/* Babylon Scene */}
    //   <div
    //     style={{
    //       position: "absolute",
    //       top: 0,
    //       left: 0,
    //       width: "100%",
    //       height: "100%",
    //       zIndex: 0,
    //     }}
    //   >
    //     <BabylonScene />
    //   </div>

    //   {/* Overlay AuthPage */}
    //   {!isAuthenticated && (
    //     <div 
    //       style={{
    //         position: "absolute",
    //         top: 0,
    //         left: 0,
    //         width: "100%",
    //         height: "100%",
    //         zIndex: 10,
    //       }}
    //     >
    //       <AuthPage />
    //     </div>
    //   )}
    // </div>
    <ApiTester />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
