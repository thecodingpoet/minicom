import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { useNavigate, Link } from "react-router-dom";
import { SIGN_IN } from "../graphql/mutations";
import { useAuth } from "../utils/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const [signIn, { loading }] = useMutation(SIGN_IN);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

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
      <sl-card className="auth-card">
        <h2>Sign In</h2>
        {error && (
          <sl-alert variant="danger" open>
            {error}
          </sl-alert>
        )}
        <form onSubmit={handleSubmit}>
          <sl-input
            label="Email"
            type="email"
            value={email}
            onSlInput={(e) => setEmail(e.target.value)}
            required
          />
          <sl-input
            label="Password"
            type="password"
            value={password}
            onSlInput={(e) => setPassword(e.target.value)}
            required
          />
          <sl-button
            type="submit"
            variant="primary"
            style={{ width: "100%", marginTop: "16px" }}
            loading={loading || undefined}
          >
            Sign In
          </sl-button>
        </form>
        <p style={{ marginTop: "16px", textAlign: "center" }}>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </sl-card>
    </div>
  );
}
