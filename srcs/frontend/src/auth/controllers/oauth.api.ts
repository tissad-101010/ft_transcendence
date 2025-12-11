
// request to backend to handle oauth
const API_URL = window.__ENV__.BACKEND_URL;

export async function providerOAuth(provider: string): Promise<void> {
    try {
        window.location.href = `${API_URL}/api/user/oauth/${provider}/provider`;
    } catch (err) {
        console.error("An error occurred during OAuth initiation:", err);
    }
}