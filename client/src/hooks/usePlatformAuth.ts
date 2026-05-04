import { useState, useEffect } from "react";

export interface PlatformOwner {
  email: string;
  timestamp: number;
}

export function usePlatformAuth() {
  const [owner, setOwner] = useState<PlatformOwner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if platform owner is logged in
    const auth = localStorage.getItem("platformOwnerAuth");
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        setOwner(parsed);
      } catch {
        localStorage.removeItem("platformOwnerAuth");
      }
    }
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem("platformOwnerAuth");
    setOwner(null);
  };

  return {
    owner,
    loading,
    isAuthenticated: !!owner,
    logout,
  };
}
