import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { useNavigate, Link } from "react-router-dom";
import { SIGN_UP } from "../graphql/mutations";
import { useAuth } from "../utils/auth";
import { ROLES } from "../constants/roles";

export default function SignUp() {
  const [error, setError] = useState("");
  const [role, setRole] = useState(ROLES.CUSTOMER);
  const navigate = useNavigate();
  const { login } = useAuth();

  const [signUp, { loading }] = useMutation(SIGN_UP);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.target);
    const variables = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      password: formData.get("password"),
      passwordConfirmation: formData.get("passwordConfirmation"),
      role,
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
    <div className="flex items-center justify-center min-h-screen p-6 bg-gradient-to-br from-gray-50 via-orange-50/50 to-amber-50/30">
      <div className="w-full max-w-[400px] bg-white rounded-2xl p-10 shadow-lg border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-accent rounded-xl inline-flex items-center justify-center text-white text-[22px] font-bold mb-4">
            M
          </div>
          <h2 className="text-[22px] font-bold text-gray-900 mb-1">Get started</h2>
          <p className="text-sm text-gray-500">Create your Minicom account</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 px-3.5 py-2.5 rounded-lg text-[13px] font-medium mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole(ROLES.CUSTOMER)}
                className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 text-center cursor-pointer transition ${
                  role === ROLES.CUSTOMER
                    ? "border-accent bg-accent/5"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <span className="text-base font-medium text-gray-900">Need help</span>
                <span className="text-xs text-gray-500">Submit and track tickets</span>
              </button>
              <button
                type="button"
                onClick={() => setRole(ROLES.AGENT)}
                className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 text-center cursor-pointer transition ${
                  role === ROLES.AGENT
                    ? "border-accent bg-accent/5"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <span className="text-base font-medium text-gray-900">Give help</span>
                <span className="text-xs text-gray-500">Respond to customer tickets</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
              <input
                type="text"
                name="firstName"
                required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
              <input
                type="text"
                name="lastName"
                required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition"
              />
            </div>
          </div>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
            <input
              type="password"
              name="passwordConfirmation"
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full bg-accent hover:bg-accent-hover text-white font-semibold py-2.5 rounded-lg text-sm transition disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="text-center mt-5 text-[13px] text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="text-accent hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
