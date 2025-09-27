import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: null, text: "" });
  const [devToken, setDevToken] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: null, text: "" });
    setDevToken(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "Unable to process password reset request");
      }

      setStatus({
        type: "success",
        text:
          data.msg ||
          "If an account with that email exists, password reset instructions have been sent.",
      });

      if (data.resetToken) {
        setDevToken(data.resetToken);
      }
    } catch (error) {
      console.error("Forgot password error:", error.message);
      setStatus({ type: "error", text: error.message });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Reset Your Password
        </h2>

        <p className="text-sm text-gray-600 text-center mb-6">
          Enter the email address associated with your account. We will send you instructions to
          reset your password if we find a match.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Send Reset Instructions
          </button>
        </form>

        {status.text && (
          <p
            className={`mt-4 text-sm text-center ${
              status.type === "error" ? "text-red-600" : "text-green-600"
            }`}
          >
            {status.text}
          </p>
        )}

        {devToken && (
          <div className="mt-6 bg-gray-100 border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
            <p className="font-semibold mb-2">Development reset token</p>
            <p className="break-all font-mono">{devToken}</p>
            <p className="mt-2">
              Paste this token on the <Link to="/reset-password" className="text-blue-600">
                reset password page
              </Link>{" "}
              to set a new password.
            </p>
          </div>
        )}

        <div className="text-center mt-6">
          <Link to="/login" className="text-sm text-blue-600 font-semibold hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
