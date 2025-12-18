import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./auth/context.tsx";
import { getApiUrl } from "./utils.ts";

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { setPending2FA, login } = useAuth();

  useEffect(() => {
    const fetchOAuthData = async () => {
      try {
        // const url = new URL(window.location.href);
        // const code = url.searchParams.get("code");
        // const provider = url.searchParams.get("provider");

        // if (!code || !provider) {
        //   console.error("Missing OAuth callback params");
        //   // navigate("/login");
        //   return;
        // }

        const response = await fetch(`${getApiUrl()}/api/user/oauth/callback`,
          {
            method: "GET",
            credentials: "include", // important to include cookies
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("OAuth callback data:", data);

          // On met à jour le contexte avec les données du backend
          if (data.twoFactorRequired) {
            setPending2FA({
              required: true,
              methods: data.methodsEnabled || [],
            });
            navigate("/"); // Redirige vers la page 2FA
          } 
        } else {
          console.error("OAuth callback failed");
          navigate("/login"); // Redirige vers la page de login en cas d'erreur
        }
      } catch (error) {
        console.error("Error during OAuth callback:", error);
        navigate("/login"); // Redirige vers la page de login en cas d'erreur réseau
      }
    };

    fetchOAuthData(); // Appel de la fonction async
  }, [navigate, setPending2FA, login]);

  return <div>Connexion en cours…</div>;
}
