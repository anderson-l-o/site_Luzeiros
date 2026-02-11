import React, { useEffect, useState } from "react";
import api from "../lib/api";
import {
  Section,
  Card,
  Input,
  InputWrapper,
  Button,
  Title,
  List,
  ListItem,
  Label,
} from "../styles/components";
import { useAuth } from "../auth/context";

export default function CadastroUsuario() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    id_usuario: "",
    name: "",
    cpf: "",
    type: "",
    phone: "",
    nickname: "",
    email: "",
    password: "",
    role: "member",
  });

  const [focus, setFocus] = useState({
    name: "",
    cpf: "",
    type: "",
    phone: "",
    nickname: "",
    email: "",
    password: "",
    role: "member",
  });

  const { user, logout } = useAuth();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  const handleFocus = (name) => setFocus({ ...focus, [name]: true });
  const handleBlur = (name) => setFocus({ ...focus, [name]: false });

  async function load() {
    const res = await api.get("/users");
    setList(res.data || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e) {
    e.preventDefault();

    try {
      if (form.id_usuario) {
        // edição
        await api.put(`/users/${form.id_usuario}`, form);
        alert("Usuário atualizado com sucesso!");
      } else {
        // criação
        await api.post("/users", form);
        alert("Usuário criado com sucesso!");
      }

      setForm({
        id_usuario: "",
        name: "",
        cpf: "",
        type: "",
        phone: "",
        nickname: "",
        email: "",
        password: "",
        role: "member",
      });
      await load();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar usuário");
    }
  }
  
  return (
    <Section>
      <Card>
        <Title>Cadastro de Usuários</Title>
        <form onSubmit={submit}>
          <InputWrapper>
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              onFocus={() => handleFocus("name")}
              onBlur={() => handleBlur("name")}
              //onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <Label active={focus.name || form.name}>Nome</Label>
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
          <InputWrapper>
            <Input
              name="email"
              value={form.email}
              onChange={handleChange}
              onFocus={() => handleFocus("email")}
              onBlur={() => handleBlur("email")}
              required
            />
            <Label active={focus.email || form.email}> E-mail</Label>
          </InputWrapper>
          <InputWrapper>
            <Input
              name="cpf"
              value={form.cpf}
              onChange={handleChange}
              onFocus={() => handleFocus("cpf")}
              onBlur={() => handleBlur("cpf")}
            />
            <Label active={focus.cpf || form.cpf}> CPF/RG</Label>
          </InputWrapper>
          <InputWrapper>
            <Input
              name="type"
              value={form.type}
              onChange={handleChange}
              onFocus={() => handleFocus("type")}
              onBlur={() => handleBlur("type")}
            />
            <Label active={focus.type || form.type}>Tipo</Label>
          </InputWrapper>
          <InputWrapper>
            <Input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              onFocus={() => handleFocus("phone")}
              onBlur={() => handleBlur("phone")}
            />
            <Label active={focus.phone || form.phone}>Telefone</Label>
          </InputWrapper>
          <InputWrapper>
            <Input
              name="nickname"
              value={form.nickname}
              onChange={handleChange}
              onFocus={() => handleFocus("nickname")}
              onBlur={() => handleBlur("nickname")}
            />
            <Label active={focus.nickname || form.nickname}>Apelido</Label>
          </InputWrapper>
          <InputWrapper>
            <Input
              placeholder="Função"
              name="role"
              value={form.role || "member"}
              onChange={handleChange}
              onFocus={() => handleFocus("role")}
              onBlur={() => handleBlur("role")}
            />
            <Label active={focus.role || form.role}>Função</Label>
          </InputWrapper>

          <Button type="submit">
            {form.id_usuario ? "Atualizar" : "Salvar"}
          </Button>
          {form.id_usuario && (
            <Button
              type="button"
              onClick={() =>
                setForm({
                  id_usuario: "",
                  name: "",
                  cpf: "",
                  type: "",
                  phone: "",
                  nickname: "",
                  email: "",
                  passwordHash: "",
                  role: "",
                })
              }
              style={{ marginLeft: "10px" }}
            >
              Cancelar
            </Button>
          )}
        </form>

        {user.role === "admin" && (
          <List>
            {list.map((u) => (
              <ListItem key={u.id_usuario || u.id}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    {u.name} ({u.type}) — {u.phone} - {u.nickname} - {u.role} - {u.password} - {u.passwordHash}
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Button
                      onClick={() =>
                        setForm({
                          id_usuario: u.id_usuario || u.id,
                          name: u.name,
                          cpf: u.cpf,
                          type: u.type,
                          phone: u.phone,
                          nickname: u.nickname,
                          email: u.email,
                          password: u.password,                          
                          role: u.role,
                        })
                      }
                    >
                      Editar
                    </Button>
                    <Button
                      onClick={async () => {
                        await api.delete("/users/" + (u.id_usuario || u.id));
                        load();
                      }}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              </ListItem>
            ))}
          </List>
        )}
      </Card>
    </Section>
  );
}
