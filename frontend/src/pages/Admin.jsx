import React, { useEffect, useState } from "react";
import api from "../lib/api.js";
import {
  Section,
  Card,
  Button,
  Input,
  InputWrapper,
  Label,
  Title,
  Subtitle,
  List,
  ListItem,
  CustomSelect,
} from "../styles/components";
import styled from "styled-components";

const CheckboxButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
`;

export default function Admin() {
  const [tipos, setTipos] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    points: 0,
    active: true,
  });

  async function load() {
    const [tRes, uRes] = await Promise.all([
      api.get("/achievement-types"),
      api.get("/users"),
    ]);
    setTipos(tRes.data);
    setUsers(uRes.data);
  }

  async function add(e) {
    e.preventDefault();
    await api.post("/achievement-types", form);
    setForm({ name: "", description: "", points: 0, active: true });
    await load();
  }
  async function delType(id) {
    await api.delete("/achievement-types/" + id);
    await load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <Section>
      <Card>
        <Title>Admin</Title>

        <form onSubmit={add}>
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
              placeholder="Descrição"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </InputWrapper>
          <InputWrapper>
            <Input
              type="number"
              placeholder="Pontos"
              value={form.points}
              onChange={(e) =>
                setForm({ ...form, points: parseInt(e.target.value) })
              }
            />
          </InputWrapper>
          <CheckboxButtonWrapper>
            <label
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                style={{ width: "auto", marginRight: 8 }}
              />{" "}
              Ativo
            </label>     
          
          
            <button type="submit">Criar</button>
          </CheckboxButtonWrapper>
        </form>
        <List>
          {tipos.map((t) => (
            <ListItem key={t.id}>
              {t.name} <Button onClick={() => delType(t.id)}>Excluir</Button>
            </ListItem>
          ))}
        </List>
        <div
          style={{
            marginTop: 12,
            background: "#fff",
            padding: 16,
            borderRadius: 8,
          }}
        >
          <Subtitle>Usuários</Subtitle>
          <List>
            {users.map((u) => (
              <ListItem key={u.id}>
                {u.name} — {u.email} ({u.role})
              </ListItem>
            ))}
          </List>
        </div>
      </Card>
    </Section>
  );
}
