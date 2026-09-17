import { useState } from "react";
import { Link } from "react-router-dom";
import { AUTH_URL } from "../hooks/authFetch";
import "./ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("L'email est requis");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${AUTH_URL}/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Une erreur est survenue"
        );
      }

      setMessage(data.message);
      setEmail("");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="forgot-password">
      <h2>Mot de passe oublié ?</h2>

      <p>
        Entre ton adresse email et tu recevras un lien pour
        réinitialiser ton mot de passe.
      </p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="forgot-email">
          Email
        </label>

        <input
          id="forgot-email"
          type="email"
          placeholder="user@exemple.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {error && (
          <p className="field-error">
            {error}
          </p>
        )}

        {message && (
          <p className="success-message">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Envoi..."
            : "Envoyer le lien"}
        </button>
      </form>

      <Link to="/">
        Retour à l'accueil
      </Link>
    </div>
  );
}

export default ForgotPassword;