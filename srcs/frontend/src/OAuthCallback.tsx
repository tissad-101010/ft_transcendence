import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AuthProvider } from "./auth/context.tsx";




export default function OAuthCallback() {
  const [params] = useSearchParams();

  useEffect(() => {
    // make fetch to backend to complete OAuth flow
    
    
  }, []);

  return <div>Connexion en cours…</div>;
}
