import "./LoginPage.css";
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authClient } from "../../utils/auth.js";
import { Eye, EyeOff, Mail, Lock, Loader2, ArrowRight } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const { refetch } = authClient.useSession();

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    await authClient.signIn.email(
      {
        email,
        password,
      },
      {
        onRequest: () => {
          setLoading(true);
        },

        onSuccess: async () => {
          await refetch();
          setLoading(false);
          navigate("/");
        },

        onError: (ctx) => {
          setLoading(false);
          setError(ctx.error.message || "Login failed");
        },
      }
    );
  };

  return (
    <div className="login-wrapper">
      {/* Background Decorative Blobs */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">Welcome back</h1>
            <p className="login-subtitle">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label className="input-label">Email</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={20} />
                <input
                  className="input-field"
                  type="email"
                  value={email}
                  placeholder="example@email.com"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={20} />
                <input
                  className="input-field"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  placeholder="Enter your password"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" disabled={loading} className="submit-button">
              {loading ? (
                <Loader2 className="spinner" size={24} />
              ) : (
                <>
                  <span>Submit</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            <p className="footer-text">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="footer-link">
                Sign up
              </Link>
            </p>
          </form>
        </div>
        <p className="security-badge">Protected by SecureLayer AI</p>
      </div>
    </div>
  );
};

export default Login;
