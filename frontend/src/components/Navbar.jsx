import { useState } from "react";
import { Link } from "react-router-dom";
import AuthModal from "./AuthModal";
import useAuth from "../hooks/useAuth";
import "./Navbar.css";

function Navbar() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { user, isLoading, login, signup, logout } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/">Home</Link>
      <Link to="/todo">To Do List</Link>
      <Link to="/contact">Nos contacts</Link>

      {!isLoading && (
        <>
          {user ? (
            <div className="navbar-user">
              <span className="navbar-greeting">Bonjour, {user.name}</span>
              <button className="navbar-logout-btn" onClick={logout}>
                Déconnexion
              </button>
            </div>
          ) : (
            <button className="navbar-login-btn" onClick={() => setIsAuthOpen(true)}> Se connecter</button>
          )}
        </>
      )}

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={login}
        onSignup={signup}
        />
    </nav>
  );
}

export default Navbar;