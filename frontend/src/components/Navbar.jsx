import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/context.jsx";
import styled from "styled-components";
import LogoClube from "./LogoClube.jsx";
import LogoAventureiro from "./LogoAventureiro.jsx";

// Contêiner principal do Navbar
const Nav = styled.nav`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px 24px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const NavLeft = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px 24px;
  gap: 16px;  
`;

const NavRight = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const NavLink = styled(Link)`
  text-decoration: none;
  color: #333;
  font-weight: 500;
  font-size: 16px;
  transition: color 0.3s ease;

  &:hover {
    color: #007bff;
  }
`;

const Button = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s ease;

  &:hover {
    background-color: #0056b3;
  }
`;

// Dropdown Menu
const DropdownWrapper = styled.div`
  position: relative;
`;

const DropdownButton = styled(Button)`
  background-color: #7d8894ff;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 40px;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  min-width: 180px;
  z-index: 1000;

  display: ${({ open }) => (open ? "block" : "none")};
  opacity: ${({ open }) => (open ? 1 : 0)};
  transform: ${({ open }) =>
    open ? "translateY(0)" : "translateY(-10px)"};
  transition: opacity 0.25s ease, transform 0.25s ease;

  a {
    display: block;
    padding: 10px 16px;
    color: #333;
    text-decoration: none;
    transition: background 0.2s ease;

    &:hover {
      background: #f1f1f1;
    }
  }
`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    alert("Você saiu com sucesso!");
    navigate("/");
  };

  // Fecha o menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fecha o menu quando clicar em um link
  const handleLinkClick = () => {
    setMenuOpen(false);
  };

  return (
    <Nav>
      <NavLeft>
        <LogoClube onClick={() => navigate("/")} />
        <NavLink to="/">Luzeiros do Prado</NavLink>
        <NavLink to="/historia">Nossa História</NavLink>
        <NavLink to="/fotos">Fotos</NavLink>
        <NavLink to="/projetos">Projetos</NavLink>
        <NavLink to="/apoiar">Apoiar</NavLink>
      </NavLeft>

      <NavRight>
        {user ? (
          <>
            <DropdownWrapper ref={menuRef}>
              <DropdownButton onClick={() => setMenuOpen(!menuOpen)}>
                Menu ▼
              </DropdownButton>
              <DropdownMenu open={menuOpen}>
                <NavLink to="/conquistas" onClick={handleLinkClick}>
                  Conquistas
                </NavLink>
                <NavLink to="/perfil" onClick={handleLinkClick}>
                  Meu Perfil
                </NavLink>
                {user.role === "admin" && (
                  <>
                    <NavLink to="/admin" onClick={handleLinkClick}>
                      Admin
                    </NavLink>
                    <NavLink to="/cadastro-usuario" onClick={handleLinkClick}>
                      Cadastro de Usuário
                    </NavLink>
                    <NavLink to="/cadastro-atividades" onClick={handleLinkClick}>
                      Cadastro de Atividades
                    </NavLink>
                    <NavLink to="/niveis" onClick={handleLinkClick}>
                      Níveis
                    </NavLink>
                  </>
                )}
              </DropdownMenu>
            </DropdownWrapper>

            <span>{user.name}</span>
            <Button onClick={handleLogout}>Sair</Button>
          </>
        ) : (
          <NavLink to="/login">
            <Button>Login</Button>
          </NavLink>
        )}
      </NavRight>

      <LogoAventureiro />
    </Nav>
  );
}
