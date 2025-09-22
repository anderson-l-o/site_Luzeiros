import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api.js";
const Ctx = createContext();


export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  useEffect(() => {
    const s = localStorage.getItem("user");
    if (s) setUser(JSON.parse(s));
  }, []);
  async function login(email, password) {
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
  }
  
  async function register(name, email, password) {
    const { data } = await api.post("/auth/register", {
      name,
      email,
      password,
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
  }
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }
  return (
    <Ctx.Provider value={{ user, login, register, logout }}>
      {children}
    </Ctx.Provider>
  );
}
export function useAuth() {
  return useContext(Ctx);
}
