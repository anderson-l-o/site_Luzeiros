import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import styled, { ThemeProvider } from "styled-components";
import { tema } from "./styles/theme.js";
import { GlobalStyles } from "./styles/GlobalStyles.jsx";
import Home from "./pages/Home.jsx";
import Conquistas from "./pages/Conquistas.jsx";
import Navbar from "./components/Navbar.jsx";
import { AuthProvider, useAuth } from "./auth/context.jsx";
import Admin from "./pages/Admin.jsx";
import Login from "./pages/Login.jsx";
import CadastroUsuario from "./pages/CadastroUsuario.jsx";



function Protected({children, role}){
  const {user} = useAuth();
  if(!user) return <Navigate to="/" replace />
  if(role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <ThemeProvider theme={tema}>
      <GlobalStyles />
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/conquistas" element={<Conquistas />} />
            <Route path="/admin" element={<Protected role="admin"><Admin/></Protected>}/>
            <Route path="/cadastro-usuario" element={<Protected role="admin"><CadastroUsuario/></Protected>}/>
            <Route path="/login" element={<Login />} />
            <Route path="/login" element={<Login />} />
          </Routes>          
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
