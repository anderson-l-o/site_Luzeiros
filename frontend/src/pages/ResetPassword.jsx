import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../auth/context.jsx";
import {
  Section,
  Card,
  Button,
  Input,
  InputWrapper,
  Label,
  Title,
  ErrorMessage,
} from "../styles/components";

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Pegar token da URL se existir
    const urlToken = searchParams.get("token");
    if (urlToken) {
      setToken(urlToken);
    }
  }, [searchParams]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem");
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres");
      setLoading(false);
      return;
    }

    try {
      const result = await resetPassword(token, newPassword);
      setMessage(result.message);
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao redefinir senha");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Section>
      <Card style={{ maxWidth: "400px", margin: "50px auto" }}>
        <Title>Redefinir Senha</Title>

        <form onSubmit={handleSubmit}>
          <InputWrapper>
            <Label htmlFor="token">Token de Recuperação</Label>
            <Input
              id="token"
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Cole o token recebido por email"
              required
            />
          </InputWrapper>

          <InputWrapper>
            <Label htmlFor="newPassword">Nova Senha</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Digite a nova senha"
              required
            />
            <small style={{ color: "#666", fontSize: "12px" }}>
              Mínimo 8 caracteres, com maiúscula, minúscula e número
            </small>
          </InputWrapper>

          <InputWrapper>
            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme a nova senha"
              required
            />
          </InputWrapper>

          {error && <ErrorMessage>{error}</ErrorMessage>}
          {message && <p style={{ color: "green", margin: "10px 0" }}>{message}</p>}

          <Button type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Redefinindo..." : "Redefinir Senha"}
          </Button>
        </form>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Link to="/login" style={{ color: "#007bff", textDecoration: "none" }}>
            Voltar ao Login
          </Link>
        </div>
      </Card>
    </Section>
  );
}