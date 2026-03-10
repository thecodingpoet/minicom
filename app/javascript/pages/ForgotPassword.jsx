import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { Link } from "react-router-dom";
import { REQUEST_PASSWORD_RESET } from "../graphql/mutations";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [requestReset, { loading }] = useMutation(REQUEST_PASSWORD_RESET);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;

    try {
      const { data } = await requestReset({ variables: { email: trimmedEmail } });
      const result = data.requestPasswordReset;

      if (result.errors?.length > 0) {
        setError(result.errors.join(", "));
        return;
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 bg-gradient-to-br from-gray-50 via-orange-50/50 to-amber-50/30">
        <div className="w-full max-w-[400px] bg-white rounded-2xl p-10 shadow-lg border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-accent rounded-xl inline-flex items-center justify-center text-white text-[22px] font-bold mb-4">
              M
            </div>
            <h2 className="text-[22px] font-bold text-gray-900 mb-1">Check your email</h2>
            <p className="text-sm text-gray-500">
              If an account exists for that address, you'll receive a link to reset your password within a few minutes.
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-[13px] text-gray-500 text-center">
              Didn't receive an email? Check your spam folder or{" "}
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-accent hover:underline font-medium"
              >
                try again
              </button>
            </p>
            <Link
              to="/login"
              className="block w-full text-center py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 transition"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-gradient-to-br from-gray-50 via-orange-50/50 to-amber-50/30">
      <div className="w-full max-w-[400px] bg-white rounded-2xl p-10 shadow-lg border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-accent rounded-xl inline-flex items-center justify-center text-white text-[22px] font-bold mb-4">
            M
          </div>
          <h2 className="text-[22px] font-bold text-gray-900 mb-1">Forgot password?</h2>
          <p className="text-sm text-gray-500">Enter your email and we'll send you a reset link</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 px-3.5 py-2.5 rounded-lg text-[13px] font-medium mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full bg-accent hover:bg-accent-hover text-white font-semibold py-2.5 rounded-lg text-sm transition disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <div className="text-center mt-5 text-[13px] text-gray-500">
          Remember your password?{" "}
          <Link to="/login" className="text-accent hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
