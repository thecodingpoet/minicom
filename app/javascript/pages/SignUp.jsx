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
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-icon">M</div>
          <h2>Get started</h2>
          <p>Create your Minicom account</p>
        </div>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <sl-input label="First Name" name="firstName" required />
            <sl-input label="Last Name" name="lastName" required />
          </div>
          <sl-input label="Email" name="email" type="email" required />
          <sl-input label="Password" name="password" type="password" required />
          <sl-input label="Confirm Password" name="passwordConfirmation" type="password" required />
          <sl-button
            type="submit"
            variant="primary"
            className="auth-submit"
            style={{ width: "100%" }}
            loading={loading || undefined}
          >
            Create Account
          </sl-button>
        </form>
        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
