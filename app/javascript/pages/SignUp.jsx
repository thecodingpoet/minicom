import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { useNavigate, Link } from "react-router-dom";
import { SIGN_UP } from "../graphql/mutations";
import { useAuth } from "../utils/auth";

export default function SignUp() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    passwordConfirmation: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const [signUp, { loading }] = useMutation(SIGN_UP);

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const { data } = await signUp({ variables: form });
      const result = data.signUp;

      if (result.errors.length > 0) {
        setError(result.errors.join(", "));
        return;
      }

      login(result.token, result.user);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page">
      <sl-card className="auth-card">
        <h2>Create Account</h2>
        {error && (
          <sl-alert variant="danger" open>
            {error}
          </sl-alert>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <sl-input
              label="First Name"
              value={form.firstName}
              onSlInput={update("firstName")}
              required
            />
            <sl-input
              label="Last Name"
              value={form.lastName}
              onSlInput={update("lastName")}
              required
            />
          </div>
          <sl-input
            label="Email"
            type="email"
            value={form.email}
            onSlInput={update("email")}
            required
          />
          <sl-input
            label="Password"
            type="password"
            value={form.password}
            onSlInput={update("password")}
            required
          />
          <sl-input
            label="Confirm Password"
            type="password"
            value={form.passwordConfirmation}
            onSlInput={update("passwordConfirmation")}
            required
          />
          <sl-button
            type="submit"
            variant="primary"
            style={{ width: "100%", marginTop: "16px" }}
            loading={loading || undefined}
          >
            Sign Up
          </sl-button>
        </form>
        <p style={{ marginTop: "16px", textAlign: "center" }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </sl-card>
    </div>
  );
}
