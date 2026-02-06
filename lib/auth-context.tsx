"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  admin: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (adminName: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);



export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Restore admin from localStorage on mount
    const storedAdmin = localStorage.getItem("name");
    if (storedAdmin) {
      setAdmin(storedAdmin);
    }
    setIsHydrated(true);
  }, []);

  const login = async (name: string, password: string): Promise<boolean> => {
    const validAdmin: any = await fetch("http://localhost:3000/user/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password }),
    });

    const data = await validAdmin.json();
    console.log(data, "================");
    if (!data.access_token) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return false;
    } else {
      setAdmin(name);
      console.log(data);
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("name", data.user.name);
      toast({
        title: "Success",
        description: "Logged in successfully!",
      });
      return true;
    }
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem("token");
    localStorage.removeItem("name");
  };

  return (
    <AuthContext.Provider
      value={{ admin, isAuthenticated: !!admin, isHydrated, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
