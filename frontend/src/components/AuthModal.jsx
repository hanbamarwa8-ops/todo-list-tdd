import { useState } from "react";
import { Link } from "react-router-dom";
import "./AuthModal.css";


function AuthModal({ isOpen, onClose, onLogin, onSignup }) {
  const [mode, setMode] = useState("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setErrors({});
    setShowPassword(false);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const validate = () => {
    const newErrors = {};

    if (mode === "signup" && !name.trim()) {
      newErrors.name = "Le nom est requis";
    }

    if (!email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Format d'email invalide";
    }

    if (!password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (mode === "signup" && password.length < 8) {
      newErrors.password = "8 caractères minimum";
    }

    if (mode === "signup" && confirmPassword !== password) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      if (mode === "login") {
        await onLogin(email, password);
      } else {
        await onSignup(name, email, password);
      }

      handleClose();
    } catch (error) {
      setErrors({ form: error.message || "Une erreur est survenue, réessaie." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-overlay" onClick={handleOverlayClick}>
      <div className="auth-modal">
        <button className="auth-close" onClick={handleClose} aria-label="Fermer">
          <span className="material-symbols-outlined">close</span>
        </button>

        <h2 className="auth-title">
          {mode === "login" ? "Bon retour" : "Créer un compte"}
        </h2>
        <p className="auth-subtitle">
          {mode === "login"
            ? "Connecte-toi pour retrouver tes tâches"
            : "Rejoins-nous en quelques secondes"}
        </p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {mode === "signup" && (
            <div className="auth-field">
              <label htmlFor="auth-name">Nom</label>
              <input
                id="auth-name"
                type="text"
                placeholder="Nom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={errors.name ? "input-error" : ""}
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              placeholder="User@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errors.email ? "input-error" : ""}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="auth-field">
            <label htmlFor="auth-password">Mot de passe</label>
            <div className="password-wrapper">
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={errors.password ? "input-error" : ""}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                <span className="material-symbols-outlined">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          {mode === "signup" && (
            <div className="auth-field">
              <label htmlFor="auth-confirm">Confirmer le mot de passe</label>
              <input
                id="auth-confirm"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={errors.confirmPassword ? "input-error" : ""}
              />
              {errors.confirmPassword && (
                <span className="field-error">{errors.confirmPassword}</span>
              )}
            </div>
          )}

          {mode === "login" && (
            <Link  to="/forgot-password"
            className="auth-forgot"
            onClick={handleClose}>Mot de passe oublié ?
            </Link>
          )}

          {errors.form && <p className="field-error form-error">{errors.form}</p>}

          <button type="submit" className="auth-submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Chargement..."
              : mode === "login"
              ? "Se connecter"
              : "Créer mon compte"}
          </button>
        </form>

        <p className="auth-switch">
          {mode === "login" ? (
            <>
              Pas encore de compte ?{" "}
              <button type="button" className="auth-switch-link" onClick={() => switchMode("signup")}>
                Créer un compte
              </button>
            </>
          ) : (
            <>
              Déjà un compte ?{" "}
              <button type="button" className="auth-switch-link" onClick={() => switchMode("login")}>
                Se connecter
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default AuthModal;