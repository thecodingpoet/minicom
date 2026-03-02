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

    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");

    if (!email || !password) return;

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
    <div className="flex items-center justify-center min-h-screen p-6 bg-gradient-to-br from-gray-50 via-orange-50/50 to-amber-50/30">
      <div className="w-full max-w-[400px] bg-white rounded-2xl p-10 shadow-lg border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-accent rounded-xl inline-flex items-center justify-center text-white text-[22px] font-bold mb-4">
            M
          </div>
          <h2 className="text-[22px] font-bold text-gray-900 mb-1">Welcome back</h2>
          <p className="text-sm text-gray-500">Sign in to your Minicom account</p>
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
              name="email"
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <input
              type="password"
              name="password"
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full bg-accent hover:bg-accent-hover text-white font-semibold py-2.5 rounded-lg text-sm transition disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="text-center mt-5 text-[13px] text-gray-500">
          Don't have an account?{" "}
          <Link to="/signup" className="text-accent hover:underline font-medium">
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}
