import { useState } from "react";
import "./AuthModal.css";
import { useAuth } from "./useAuth.js";

export default function AuthModal() {
  const {
    activeTab,
    login,
    setActiveTab,
    setShowAuthModal,
    showAuthModal,
    signup,
  } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!showAuthModal) return null;

  const isSignup = activeTab === "signup";

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setError("");
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    resetForm();
  };

  const closeModal = () => {
    setShowAuthModal(false);
    resetForm();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignup) {
        await signup(name.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authOverlay" role="dialog" aria-modal="true">
      <form className="authModal" onSubmit={handleSubmit}>
        <button
          aria-label="Close auth dialog"
          className="authClose"
          onClick={closeModal}
          type="button"
        >
          <i className="fa-solid fa-xmark" aria-hidden="true" />
        </button>

        <div className="authTabs">
          <button
            className={activeTab === "login" ? "active" : ""}
            onClick={() => switchTab("login")}
            type="button"
          >
            Log in
          </button>
          <button
            className={activeTab === "signup" ? "active" : ""}
            onClick={() => switchTab("signup")}
            type="button"
          >
            Sign up
          </button>
        </div>

        <h2>{isSignup ? "Create your account" : "Welcome back"}</h2>

        {isSignup && (
          <label>
            Name
            <input
              autoComplete="name"
              onChange={(event) => setName(event.target.value)}
              required
              type="text"
              value={name}
            />
          </label>
        )}

        <label>
          Email
          <input
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>

        <label>
          Password
          <input
            autoComplete={isSignup ? "new-password" : "current-password"}
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>

        {error && <p className="authError">{error}</p>}

        <button className="authSubmit" disabled={loading} type="submit">
          {loading ? "Please wait..." : isSignup ? "Create account" : "Log in"}
        </button>
      </form>
    </div>
  );
}
