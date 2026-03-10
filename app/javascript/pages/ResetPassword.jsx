import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { RESET_PASSWORD } from "../graphql/mutations";
import { useAuth } from "../utils/auth";
import { isCustomer } from "../constants/roles";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const [resetPassword, { loading }] = useMutation(RESET_PASSWORD);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.target);
    const password = formData.get("password");
    const passwordConfirmation = formData.get("passwordConfirmation");

    if (!token) {
      setError("Invalid reset link. Please request a new one.");
      return;
    }
    if (!password || !passwordConfirmation) return;

    try {
      const { data } = await resetPassword({
        variables: { token, password, passwordConfirmation },
      });
      const result = data.resetPassword;

      if (result.errors?.length > 0) {
        setError(result.errors.join(", "));
        return;
      }

      login(result.token, result.user);
      navigate(isCustomer(result.user) ? "/" : "/agent", { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 bg-gradient-to-br from-gray-50 via-orange-50/50 to-amber-50/30">
        <div className="w-full max-w-[400px] bg-white rounded-2xl p-10 shadow-lg border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-accent rounded-xl inline-flex items-center justify-center text-white text-[22px] font-bold mb-4">
              M
            </div>
            <h2 className="text-[22px] font-bold text-gray-900 mb-1">Invalid reset link</h2>
            <p className="text-sm text-gray-500 mb-6">
              This password reset link is missing or invalid. Please request a new one.
            </p>
            <Link
              to="/forgot-password"
              className="inline-block w-full text-center py-2.5 rounded-lg text-sm font-semibold bg-accent hover:bg-accent-hover text-white transition"
            >
              Request new link
            </Link>
          </div>
          <div className="text-center text-[13px] text-gray-500">
            <Link to="/login" className="text-accent hover:underline font-medium">
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
          <h2 className="text-[22px] font-bold text-gray-900 mb-1">Choose a new password</h2>
          <p className="text-sm text-gray-500">Enter your new password below</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 px-3.5 py-2.5 rounded-lg text-[13px] font-medium mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">New password</label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
            <input
              type="password"
              name="passwordConfirmation"
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full bg-accent hover:bg-accent-hover text-white font-semibold py-2.5 rounded-lg text-sm transition disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset password"}
          </button>
        </form>

        <div className="text-center mt-5 text-[13px] text-gray-500">
          <Link to="/login" className="text-accent hover:underline font-medium">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
