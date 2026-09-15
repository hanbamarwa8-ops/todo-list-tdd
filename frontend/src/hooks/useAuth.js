import { useState, useEffect } from "react";

const AUTH_URL = "http://localhost:3001/api/auth";

function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Lors de chargement de l'app, on vérifie si un cookie de session valide existe déjà ou pas 
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch(`${AUTH_URL}/me`, {
        credentials: "include" //<!> Essenciel pour envoyer le cookie httpOnly
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await fetch(`${AUTH_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
      headers: { "Content-Type": "application/json" },
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

  return { user, isLoading, login, signup, logout };
}

export default useAuth;