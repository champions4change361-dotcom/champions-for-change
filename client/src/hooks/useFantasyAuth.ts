import { useState, useEffect } from "react";

interface FantasyUser {
  id: string;
  email: string;
  isFantasyUser: boolean;
  ageVerified: boolean;
  createdAt: string;
}

export function useFantasyAuth() {
  const [fantasyUser, setFantasyUser] = useState<FantasyUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing fantasy user in localStorage
    const storedUser = localStorage.getItem("fantasyUser");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setFantasyUser(user);
      } catch (error) {
        console.error("Error parsing fantasy user:", error);
        localStorage.removeItem("fantasyUser");
      }
    }
    setIsLoading(false);
  }, []);

  const loginFantasyUser = (user: FantasyUser) => {
    setFantasyUser(user);
    localStorage.setItem("fantasyUser", JSON.stringify(user));
  };

  const logoutFantasyUser = () => {
    setFantasyUser(null);
    localStorage.removeItem("fantasyUser");
  };

  return {
    fantasyUser,
    isFantasyAuthenticated: !!fantasyUser,
    isLoading,
    loginFantasyUser,
    logoutFantasyUser
  };
}