import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { useNavigate, Link } from "react-router-dom";
import { SIGN_UP } from "../graphql/mutations";
import { useAuth } from "../utils/auth";

export default function SignUp() {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const [signUp, { loading }] = useMutation(SIGN_UP);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const form = e.target;
    const variables = {
      firstName: form.querySelector('[name="firstName"]').value,
      lastName: form.querySelector('[name="lastName"]').value,
      email: form.querySelector('[name="email"]').value,
      password: form.querySelector('[name="password"]').value,
      passwordConfirmation: form.querySelector('[name="passwordConfirmation"]').value,
    };

    try {
      const { data } = await signUp({ variables });
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
            <sl-input label="First Name" name="firstName" required />
            <sl-input label="Last Name" name="lastName" required />
          </div>
          <sl-input label="Email" name="email" type="email" required />
          <sl-input label="Password" name="password" type="password" required />
          <sl-input
            label="Confirm Password"
            name="passwordConfirmation"
            type="password"
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
