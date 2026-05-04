import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { AlertCircle, Lock } from "lucide-react";

export default function PlatformLogin() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // TODO: Replace with actual platform owner authentication
      // For now, check against pre-seeded credentials
      if (email === "admin@primecontractoros.com" && password === "admin123") {
        // Store platform owner session
        localStorage.setItem("platformOwnerAuth", JSON.stringify({ email, timestamp: Date.now() }));
        navigate("/platform");
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl font-bold text-white mb-2">PrimeContractorOS</div>
          <div className="text-blue-100">Platform Owner Admin</div>
          <div className="text-xs text-blue-200 mt-3">Created by Dominique Reed • Reed Solutions LLC</div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-2xl font-bold text-blue-900 mb-6 text-center">Platform Admin Login</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@primecontractoros.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-900 hover:bg-blue-800 text-white py-2 rounded-lg font-medium transition-colors disabled:bg-gray-400"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-600 font-medium uppercase mb-3">Demo Credentials</p>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Email:</span>
                <code className="text-sm font-mono text-blue-900 bg-white px-2 py-1 rounded border border-gray-200">
                  admin@primecontractoros.com
                </code>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Password:</span>
                <code className="text-sm font-mono text-blue-900 bg-white px-2 py-1 rounded border border-gray-200">
                  admin123
                </code>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                <span className="text-sm text-gray-600">Owner:</span>
                <span className="text-sm font-medium text-blue-900">Dominique Reed</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              <Lock className="w-3 h-3 inline mr-1" />
              Platform Owner Account • Reed Solutions LLC
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-blue-100 text-sm">
          <p>Platform Owner Admin Area</p>
          <p className="text-xs text-blue-200 mt-1">© 2026 PrimeContractorOS</p>
        </div>
      </div>
    </div>
  );
}
