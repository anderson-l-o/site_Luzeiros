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
} from "../styles/components";

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
    passwordHash: "",
    role: "member",
  });

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
        passwordHash: "",
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
              placeholder="Nome"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </InputWrapper>
          <InputWrapper>
            <Input
              placeholder="Senha"
              type="password"
              value={form.passwordHash}
              onChange={(e) =>
                setForm({ ...form, passwordHash: e.target.value })
              }
              required={!form.id_usuario} // só exige senha ao criar
            />
          </InputWrapper>
          <InputWrapper>
            <Input
              placeholder="E-mail"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              
            />
          </InputWrapper>
          <InputWrapper>
            <Input
              placeholder="CPF/RG"
              value={form.cpf}
              onChange={(e) => setForm({ ...form, cpf: e.target.value })}
            />
          </InputWrapper>
          <InputWrapper>
            <Input
              placeholder="Tipo"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            />
          </InputWrapper>
          <InputWrapper>
            <Input
              placeholder="Telefone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </InputWrapper>
          <InputWrapper>
            <Input
              placeholder="Apelido"
              value={form.nickname}
              onChange={(e) => setForm({ ...form, nickname: e.target.value })}
            />
          </InputWrapper>
          <InputWrapper>
            <Input
              placeholder="Função"
              value={form.role || "member"}
              onChange={(e) => setForm({ ...form, role: e.target.value  })}
            />
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
                  role:"",
                })
              }
              style={{ marginLeft: "10px" }}
            >
              Cancelar
            </Button>
          )}
        </form>

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
                  {u.name} ({u.type}) — {u.phone} - {u.nickname} - {u.role}
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
                        passwordHash: "", // não exibir senha
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
      </Card>
    </Section>
  );
}
