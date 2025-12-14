import "./SignupPage.css";
import { useState } from "react";
import { authClient } from "../../utils/auth";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

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
          await refetch(); // ⏳ wait for session sync
          navigate("/");
        },

        onError: (ctx) => {
          setLoading(false);
          setError(ctx.error.message);
        },
      }
    );
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2 className="signup-title">Create Account</h2>

        <label htmlFor="name">Name</label>
        <input
          type="text"
          name="name"
          id="name"
          value={form.name}
          placeholder="What we call you!"
          onChange={handleChange}
          required
        />

        <label htmlFor="email">Email</label>
        <input
          type="email"
          name="email"
          id="email"
          value={form.email}
          placeholder="example@email.com"
          onChange={handleChange}
          required
        />

        <label htmlFor="password">Password</label>
        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            id="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </button>

        <p className="signup-footer-text">
          Already have an account?{" "}
          <Link to="/login" className="signup-footer-link">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
