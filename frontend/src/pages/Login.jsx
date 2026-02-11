import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAuth } from "../auth/context.jsx";
import { useNavigate, Link } from "react-router-dom";
import {
  Section,
  Card,
  Button,
  Input,
  InputWrapper,
  Label,
  ErrorMessage
} from "../styles/components";

const ModeSwitcher = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

export default function Home() {
  const { login, register, user } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focus, setFocus] = useState({
    name: false,
    email: false,
    password: false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  const handleFocus = (name) => setFocus({ ...focus, [name]: true });
  const handleBlur = (name) => setFocus({ ...focus, [name]: false });

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }
      navigate("/");
    } catch (err) {
      setError("Credenciais inválidas ou erro no servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Section >
      {!user ? (
        <Card>
          <ModeSwitcher>
            <Button
              onClick={() => setMode("login")}
              disabled={mode === "login"}
            >
              Entrar
            </Button>
            <Button
              onClick={() => setMode("register")}
              disabled={mode === "register"}
            >
              Criar conta
            </Button>
          </ModeSwitcher>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <form onSubmit={submit}>
            {mode === "register" && (
              <InputWrapper>
                <Input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  onFocus={() => handleFocus("name")}
                  onBlur={() => handleBlur("name")}
                  required
                />
                <Label active={focus.name || form.name}>Nome</Label>
              </InputWrapper>
            )}
            <InputWrapper>
              <Input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                onFocus={() => handleFocus("email")}
                onBlur={() => handleBlur("email")}
                required
              />
              <Label active={focus.email || form.email}>Email</Label>
            </InputWrapper>
            <InputWrapper>
              <Input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                onFocus={() => handleFocus("password")}
                onBlur={() => handleBlur("password")}
                required
              />
              <Label active={focus.password || form.password}>Senha</Label>
            </InputWrapper>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Processando..."
                : mode === "login"
                ? "Entrar"
                : "Registrar"}
            </Button>

            {mode === "login" && (
              <div style={{ textAlign: "center", marginTop: "10px" }}>
                <Link
                  to="/forgot-password"
                  style={{
                    color: "#007bff",
                    textDecoration: "none",
                    fontSize: "14px"
                  }}
                >
                  Esqueci minha senha
                </Link>
              </div>
            )}
          </form>
        </Card>
      ) : (
        <p>Redirecionando para o painel...</p>
      )}
    </Section>
  );
}
