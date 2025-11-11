export async function registerUser(
  username: string,
  email: string,
  password: string
): Promise<{ success: boolean; message?: string }> {
  console.log("username ", username);
  console.log("email ", email);
  console.log("password ", password);
  try {
    const response = await fetch("https://localhost:8443/api/user/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include", // envoie les cookies si backend les utilise
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (response.ok && data.signupComplete) {
      return { success: true };
    } else {
      return { success: false, message: data.message || "Registration failed" };
    }
  } catch (err) {
    console.error(err);
    return { success: false, message: "An error occurred during registration" };
  }
}

export async function loginUser(
    username: string,
    password: string
): Promise<{ success: boolean; message?: string }> {
    console.log("username ", username);
    console.log("password ", password);

    try {
        const response = await fetch("https://localhost:8443/api/user/auth/signin", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            credentials: "include", // envoie les cookies si backend les utilise
            body: JSON.stringify({ username, password }),
        });
        
        const data = await response.json(); 
        if (response.ok && data.signinComplete) {
            return { success: true };
        }
        else {
            return { success: false, message: data.message || "Login failed" };
        }
    } catch (err) {
        console.error(err);
        return { success: false, message: "An error occurred during login" };
    }
}


export async function fetchUserProfile(): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
        const response = await fetch("https://localhost:8443/api/user/profile", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            credentials: "include", // envoie les cookies si backend les utilise
        });
        
        const data = await response.json(); 
        if (response.ok) {
            return { success: true, data };
        }
        else {
            return { success: false, message: data.message || "Failed to fetch user profile" };
        }
    } catch (err) {
        console.error(err);
        return { success: false, message: "An error occurred while fetching user profile" };
    }
}





export async function logoutUser(): Promise<{ success: boolean; message?: string }> {
    try {
        const response = await fetch("https://localhost:8443/api/user/auth/signout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            credentials: "include", // envoie les cookies si backend les utilise
        });
        
        if (response.ok) {
            return { success: true };
        }
        else {
            const data = await response.json(); 
            return { success: false, message: data.message || "Logout failed" };
        }
    } catch (err) {
        console.error(err);
        return { success: false, message: "An error occurred during logout" };
    }
}