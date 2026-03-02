import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { useNavigate, Link } from "react-router-dom";
import { SIGN_IN } from "../graphql/mutations";
import { useAuth } from "../utils/auth";

export default function Login() {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const [signIn, { loading }] = useMutation(SIGN_IN);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const form = e.target;
    const email = form.querySelector('[name="email"]').value;
    const password = form.querySelector('[name="password"]').value;

    try {
      const { data } = await signIn({ variables: { email, password } });
      const result = data.signIn;

      if (result.errors.length > 0) {
        setError(result.errors.join(", "));
        return;
      }

      login(result.token, result.user);
      navigate(result.user.role === "agent" ? "/agent" : "/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-icon">M</div>
          <h2>Welcome back</h2>
          <p>Sign in to your Minicom account</p>
        </div>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <sl-input label="Email" name="email" type="email" required />
          <sl-input label="Password" name="password" type="password" required />
          <sl-button
            type="submit"
            variant="primary"
            className="auth-submit"
            style={{ width: "100%" }}
            loading={loading || undefined}
          >
            Sign In
          </sl-button>
        </form>
        <div className="auth-footer">
          Don't have an account? <Link to="/signup">Create one</Link>
        </div>
      </div>
    </div>
  );
}
