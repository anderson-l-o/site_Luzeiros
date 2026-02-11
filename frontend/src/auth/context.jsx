import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api.js";

const Ctx = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar sessão ao carregar
  useEffect(() => {
    checkSession();
  }, []);

  // Verificar sessão a cada 5 minutos
  useEffect(() => {
    if (user) {
      const interval = setInterval(checkSession, 5 * 60 * 1000); // 5 minutos
      return () => clearInterval(interval);
    }
  }, [user]);

  async function checkSession() {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!token || !savedUser) {
      setLoading(false);
      return;
    }

    try {
      // Verificar se o token ainda é válido fazendo uma requisição
      const response = await api.get("/auth/me");
      const userData = JSON.parse(savedUser);

      // Verificar se os dados do usuário ainda são consistentes
      if (response.data.user.id === userData.id) {
        setUser(userData);
      } else {
        // Dados inconsistentes, fazer logout
        await logout();
      }
    } catch (error) {
      console.error("Session check failed:", error);
      // Token inválido ou expirado, fazer logout
      await logout();
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    try {
      const { data } = await api.post("/auth/login", { email, password });

      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.userId,
          name: data.name,
          email: data.email,
          role: data.role,
        })
      );

      setUser({
        id: data.userId,
        name: data.name,
        email: data.email,
        role: data.role,
      });

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  async function register(name, email, password, additionalData = {}) {
    try {
      const { data } = await api.post("/auth/register", {
        name,
        email,
        password,
        ...additionalData,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.userId,
          name: data.name,
          email: data.email,
          role: data.role,
        })
      );

      setUser({
        id: data.userId,
        name: data.name,
        email: data.email,
        role: data.role,
      });

      return { success: true };
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  }

  async function logout() {
    try {
      // Tentar fazer logout no servidor (opcional)
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Server logout error:", error);
      // Não falhar se o logout no servidor falhar
    }

    // Limpar dados locais
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  async function forgotPassword(email) {
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      return { success: true, message: data.message, resetToken: data.resetToken };
    } catch (error) {
      console.error("Forgot password error:", error);
      throw error;
    }
  }

  async function resetPassword(token, newPassword) {
    try {
      const { data } = await api.post("/auth/reset-password", {
        token,
        newPassword,
      });
      return { success: true, message: data.message };
    } catch (error) {
      console.error("Reset password error:", error);
      throw error;
    }
  }

  async function getCurrentUser() {
    try {
      const { data } = await api.get("/auth/me");
      return data.user;
    } catch (error) {
      console.error("Get current user error:", error);
      throw error;
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    getCurrentUser,
    checkSession,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const context = useContext(Ctx);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
