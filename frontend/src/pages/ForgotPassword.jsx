import React, { useState } from "react";
import { Link } from "react-router-dom";
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

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resetToken, setResetToken] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await forgotPassword(email);
      setMessage(result.message);
      if (result.resetToken) {
        setResetToken(result.resetToken);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao enviar email de recuperação");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Section>
      <Card style={{ maxWidth: "400px", margin: "50px auto" }}>
        <Title>Recuperar Senha</Title>

        <form onSubmit={handleSubmit}>
          <InputWrapper>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu email"
              required
            />
          </InputWrapper>

          {error && <ErrorMessage>{error}</ErrorMessage>}
          {message && <p style={{ color: "green", margin: "10px 0" }}>{message}</p>}

          {resetToken && (
            <div style={{ background: "#f0f0f0", padding: "10px", margin: "10px 0", borderRadius: "4px" }}>
              <small><strong>Token de desenvolvimento:</strong> {resetToken}</small>
            </div>
          )}

          <Button type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Enviando..." : "Enviar Email de Recuperação"}
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