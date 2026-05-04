import { useState, useEffect } from "react";

export interface PlatformOwner {
  email: string;
  timestamp: number;
}

export function usePlatformAuth() {
  const [owner, setOwner] = useState<PlatformOwner | null>(() => {
    // Initialize state from localStorage immediately
    try {
      const auth = localStorage.getItem("platformOwnerAuth");
      if (auth) {
        return JSON.parse(auth);
      }
    } catch (e) {
      console.error("Failed to parse platformOwnerAuth:", e);
      localStorage.removeItem("platformOwnerAuth");
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Listen for storage changes (e.g., from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "platformOwnerAuth") {
        if (e.newValue) {
          try {
            setOwner(JSON.parse(e.newValue));
          } catch {
            setOwner(null);
          }
        } else {
          setOwner(null);
        }
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
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
