
import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

type User = {
  _id: string;
  googleId?: string;
  displayName: string;
  email: string;
  role: string;
  createdAt: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const checkAuth = async (): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await fetch("https://nexcrm-service.onrender.com/api/auth/me", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        return true;
      } else {
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error("Authentication check failed:", error);
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const response = await fetch("https://nexcrm-service.onrender.com/api/auth/logout", {
        method: "POST", // POST method for logout
        credentials: "include",
      });
      
      if (response.ok) {
        setUser(null);
        toast({
          title: "Logged out successfully",
        });
        navigate("/login");
      } else {
        throw new Error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "There was a problem logging you out",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Check authentication status when the component mounts
    checkAuth();
  }, []);

  const value = {
    user,
    loading,
    logout,
    checkAuth,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
