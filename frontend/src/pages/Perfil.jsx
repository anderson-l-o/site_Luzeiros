import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/context.jsx";
import api from "../lib/api.js";
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

export default function Perfil() {
  const { user, logout } = useAuth();
  const [form, setForm] = useState({
    name: "",
    cpf: "",
    nickname: "",
    phone: "",
    email: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [activeTab, setActiveTab] = useState("profile");

  const [focus, setFocus] = useState({
    name: false,
    cpf: false,
    nickname: false,
    phone: false,
    email: false,
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  async function loadUserProfile() {
    try {
      const response = await api.get(`/users/${user.id}`);
      const userData = response.data;
      setForm({
        name: userData.name || "",
        cpf: userData.cpf || "",
        nickname: userData.nickname || "",
        phone: userData.phone || "",
        email: userData.email || "",
      });
    } catch (err) {
      console.error("Erro ao carregar perfil:", err);
      setError("Erro ao carregar dados do perfil");
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handlePasswordChange(e) {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  }

  const handleFocus = (name) => setFocus({ ...focus, [name]: true });
  const handleBlur = (name) => setFocus({ ...focus, [name]: false });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await api.put(`/users/${user.id}`, form);
      setMessage("Perfil atualizado com sucesso!");
      // Atualizar dados do usuário no contexto se necessário
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao atualizar perfil");
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("As senhas não coincidem");
      setPasswordLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError("A nova senha deve ter pelo menos 8 caracteres");
      setPasswordLoading(false);
      return;
    }

    try {
      await api.put(`/users/${user.id}/password`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setMessage("Senha alterada com sucesso!");
      setActiveTab("profile");
    } catch (err) {
      setPasswordError(err.response?.data?.error || "Erro ao alterar senha");
    } finally {
      setPasswordLoading(false);
    }
  }

  if (!user) {
    return (
      <Section>
        <Card>
          <Title>Perfil</Title>
          <p>Você precisa estar logado para acessar esta página.</p>
        </Card>
      </Section>
    );
  }

  return (
    <Section>
      <Card style={{ maxWidth: "600px", margin: "0 auto", padding: "32px" }}>
        <Title style={{ textAlign: "center", marginBottom: "24px" }}>Meu Perfil</Title>

        {/* Abas de navegação */}
        <div style={{ display: "flex", marginBottom: "20px", borderBottom: "1px solid #eee" }}>
          <button
            onClick={() => setActiveTab("profile")}
            style={{
              padding: "10px 20px",
              border: "none",
              background: activeTab === "profile" ? "#007bff" : "transparent",
              color: activeTab === "profile" ? "white" : "#666",
              cursor: "pointer",
              borderRadius: "4px 4px 0 0",
            }}
          >
            Dados Pessoais
          </button>
          <button
            onClick={() => setActiveTab("password")}
            style={{
              padding: "10px 20px",
              border: "none",
              background: activeTab === "password" ? "#007bff" : "transparent",
              color: activeTab === "password" ? "white" : "#666",
              cursor: "pointer",
              borderRadius: "4px 4px 0 0",
            }}
          >
            Alterar Senha
          </button>
        </div>

        {message && (
          <div style={{
            padding: "10px",
            marginBottom: "20px",
            background: "#d4edda",
            color: "#155724",
            borderRadius: "4px",
            border: "1px solid #c3e6cb"
          }}>
            {message}
          </div>
        )}

        {activeTab === "profile" && (
          <form onSubmit={handleSubmit}>
            <InputWrapper>
              <Input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                onFocus={() => handleFocus("name")}
                onBlur={() => handleBlur("name")}
                required
              />
              <Label active={focus.name || form.name}>Nome Completo *</Label>
            </InputWrapper>

            <InputWrapper>
              <Input
                name="email"
                type="email"
                value={form.email}
                disabled
                style={{ background: "#f8f9fa", cursor: "not-allowed" }}
              />
              <Label active={true}>Email</Label>
              <small style={{ color: "#666", fontSize: "12px", marginTop: "4px", display: "block" }}>
                O email não pode ser alterado
              </small>
            </InputWrapper>

            <InputWrapper>
              <Input
                name="cpf"
                type="text"
                value={form.cpf}
                onChange={handleChange}
                onFocus={() => handleFocus("cpf")}
                onBlur={() => handleBlur("cpf")}
              />
              <Label active={focus.cpf || form.cpf}>CPF</Label>
            </InputWrapper>

            <InputWrapper>
              <Input
                name="nickname"
                type="text"
                value={form.nickname}
                onChange={handleChange}
                onFocus={() => handleFocus("nickname")}
                onBlur={() => handleBlur("nickname")}
              />
              <Label active={focus.nickname || form.nickname}>Apelido</Label>
            </InputWrapper>

            <InputWrapper>
              <Input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                onFocus={() => handleFocus("phone")}
                onBlur={() => handleBlur("phone")}
              />
              <Label active={focus.phone || form.phone}>Telefone</Label>
            </InputWrapper>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <Button type="submit" disabled={loading} style={{ width: "100%" }}>
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </form>
        )}

        {activeTab === "password" && (
          <form onSubmit={handlePasswordSubmit}>
            <InputWrapper>
              <Input
                name="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                onFocus={() => handleFocus("currentPassword")}
                onBlur={() => handleBlur("currentPassword")}
                required
              />
              <Label active={focus.currentPassword || passwordForm.currentPassword}>Senha Atual *</Label>
            </InputWrapper>

            <InputWrapper>
              <Input
                name="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                onFocus={() => handleFocus("newPassword")}
                onBlur={() => handleBlur("newPassword")}
                required
              />
              <Label active={focus.newPassword || passwordForm.newPassword}>Nova Senha *</Label>
              <small style={{ color: "#666", fontSize: "12px", marginTop: "4px", display: "block" }}>
                Mínimo 8 caracteres, com maiúscula, minúscula e número
              </small>
            </InputWrapper>

            <InputWrapper>
              <Input
                name="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                onFocus={() => handleFocus("confirmPassword")}
                onBlur={() => handleBlur("confirmPassword")}
                required
              />
              <Label active={focus.confirmPassword || passwordForm.confirmPassword}>Confirmar Nova Senha *</Label>
            </InputWrapper>

            {passwordError && <ErrorMessage>{passwordError}</ErrorMessage>}

            <Button type="submit" disabled={passwordLoading} style={{ width: "100%" }}>
              {passwordLoading ? "Alterando..." : "Alterar Senha"}
            </Button>
          </form>
        )}

        <div style={{ marginTop: "30px", paddingTop: "20px", borderTop: "1px solid #eee" }}>
          <Button
            onClick={logout}
            style={{
              background: "#dc3545",
              width: "100%"
            }}
          >
            Sair da Conta
          </Button>
        </div>
      </Card>
    </Section>
  );
}