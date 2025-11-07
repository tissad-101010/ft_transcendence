import React from "react";
import BabylonScene from "./BabylonScene.tsx";
import HomePage from "./HomePage.tsx";

function App() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Wrapper Babylon */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          // pointerEvents: "none", // important pour que les clics passent
        }}
      >
        <BabylonScene />
      </div>

      {/* Overlay HomePage */}
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
        <HomePage />
      </div>
    </div>
  );
}

export default App;
