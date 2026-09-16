import { useState, useEffect } from "react";

const AUTH_URL =
  `${process.env.REACT_APP_API_URL || "http://localhost:3001"}/api/auth`;
function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSession();
}, []);

  const checkSession = async () => {
    try {
      let response = await fetch(`${AUTH_URL}/me`, {
        credentials: "include"
      });

      if (response.status === 401) {
        console.log("Access Token expiré, tentative de refresh...");

        const refreshResponse = await fetch(`${AUTH_URL}/refresh`, {
          method: "POST",
          credentials: "include"
        });

        if (refreshResponse.ok) {
          console.log("Access Token renouvelé");

          response = await fetch(`${AUTH_URL}/me`, {
            credentials: "include"
          });
        }
      }

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }

    } catch (error) {
      console.error("Erreur lors de la vérification de session :", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await fetch(`${AUTH_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erreur de connexion");
    }

    setUser(data.user);
    return data.user;
  };

  const signup = async (name, email, password) => {
    const response = await fetch(`${AUTH_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de l'inscription");
    }

    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    await fetch(`${AUTH_URL}/logout`, {
      method: "POST",
      credentials: "include"
    });

    setUser(null);
  };

  return {
    user,isLoading,login,signup,logout};
}

export default useAuth;