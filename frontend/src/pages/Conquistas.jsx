import React, { useEffect, useState } from "react";
import api from "../lib/api.js";
import { useAuth } from "../auth/context.jsx";
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

export default function Conquistas() {
  const { user } = useAuth();
  const [tipos, setTipos] = useState([]);
  const [regs, setRegs] = useState([]);
  const [form, setForm] = useState({
    achievementTypeId: "",
    dateAchieved: "",
    notes: "",
  });
  const [focus, setFocus] = useState({
    dateAchieved: false,
    notes: false,
  });

  async function load() {
    try {
      const t = await api.get("/achievement-types");
      const r = user
        ? await api.get("/achievements", { params: { userId: user.id } })
        : { data: [] };
      setTipos(t.data || []);
      setRegs(r.data || []);
    } catch (e) {
      console.error(e);
    }
  }

  async function add(e) {
    e.preventDefault();
    if (!user) return alert("Faça login");
    await api.post("/achievements", {
      userId: user.id,
      achievementTypeId: form.achievementTypeId,
      dateAchieved: form.dateAchieved,
      notes: form.notes,
    });
    setForm({ achievementTypeId: "", dateAchieved: "", notes: "" });
    await load();
  }

  useEffect(() => {
    load();
  }, [user?.id]);

  const handleFocus = (name) => setFocus({ ...focus, [name]: true });
  const handleBlur = (name) => setFocus({ ...focus, [name]: false });

  return (
    <Section>
      <div style={{ width: "100%", maxWidth: 600 }}>
        <Title>Conquistas</Title>

        <Card>
          <form onSubmit={add}>
            <InputWrapper>
              <CustomSelect
                options={tipos.map((t) => ({
                  value: t.id,
                  label: `${t.name} (+${t.points})`,
                }))}
                value={form.achievementTypeId}
                onChange={(val) => setForm({ ...form, achievementTypeId: val })}
              />
              <Label active={!focus.achievementTypeId || !form.achievementTypeId}>
                Selecione um tipo
              </Label>
            </InputWrapper>

            <InputWrapper>
              <Input
                type="date"
                value={form.dateAchieved}
                onChange={(e) =>
                  setForm({ ...form, dateAchieved: e.target.value })
                }
                onFocus={() => handleFocus("dateAchieved")}
                onBlur={() => handleBlur("dateAchieved")}
                required
              />
              <Label
                active={
                  !focus.dateAchieved || form.dateAchieved || focus.dateAchieved
                }
              >
                Data
              </Label>
            </InputWrapper>

            <InputWrapper>
              <Input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                onFocus={() => handleFocus("notes")}
                onBlur={() => handleBlur("notes")}
                placeholder="Observações"
              />
              <Label active={!focus.notes || form.notes || focus.notes}>Observações</Label>
            </InputWrapper>

            <Button type="submit">Salvar</Button>
          </form>
        </Card>

        <Card style={{ marginTop: 16 }}>
          <Subtitle>Minhas conquistas</Subtitle>
          <List>
            {regs.map((r) => (
              <ListItem key={r.id}>
                {r.AchievementType?.name || r.achievementTypeId} —{" "}
                {r.dateAchieved}
              </ListItem>
            ))}
          </List>
        </Card>
      </div>
    </Section>
  );
}
