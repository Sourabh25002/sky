import "./SignupPage.css";
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authClient } from "../../utils/auth";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
} from "lucide-react";

const Signup = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { refetch } = authClient.useSession();

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    await authClient.signUp.email(
      {
        email: form.email,
        password: form.password,
        name: form.name,
      },
      {
        onRequest: () => {
          setLoading(true);
        },

        onSuccess: async () => {
          setLoading(false);
          await refetch();
          navigate("/");
        },

        onError: (ctx) => {
          setLoading(false);
          setError(ctx.error.message);
        },
      },
    );
  };

  return (
    <div className="signup-wrapper">
      {/* Background Decorative Blobs */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>

      <div className="signup-container">
        <div className="signup-card">
          <header className="signup-header">
            <h1 className="signup-title">Create Account</h1>
            <p className="signup-subtitle">Start your journey with us</p>
          </header>

          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label" htmlFor="name">
                Full Name
              </label>
              <div className="input-wrapper">
                <User className="input-icon" size={20} />
                <input
                  className="input-field"
                  type="text"
                  name="name"
                  id="name"
                  value={form.name}
                  placeholder="What we call you!"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="email">
                Email Address
              </label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={20} />
                <input
                  className="input-field"
                  type="email"
                  name="email"
                  id="email"
                  value={form.email}
                  placeholder="name@example.com"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="password">
                Password
              </label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={20} />
                <input
                  className="input-field"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a password"
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

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? (
                <Loader2 className="spinner" size={24} />
              ) : (
                <>
                  <span>Sign Up</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            <p className="footer-text">
              Already have an account?{" "}
              <Link to="/login" className="footer-link">
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
