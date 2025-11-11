
// request to backend to handle oauth
export async function handleOAuth(provider: string): Promise<void> {
    try {
        window.location.href = `https://localhost:8443/api/user/oauth/${provider}/provider`;
    } catch (err) {
        console.error("An error occurred during OAuth initiation:", err);
    }
}