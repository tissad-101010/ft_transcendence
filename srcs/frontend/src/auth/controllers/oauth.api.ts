import { getApiUrl } from "../../utils";

// request to backend to handle oauth

export async function providerOAuth(provider: string): Promise<void> {
    try {
        window.location.href = `${getApiUrl()}/api/user/oauth/${provider}/provider`;
    } catch (err) {
        console.error("An error occurred during OAuth initiation:", err);
    }
}