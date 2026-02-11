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
  const [mode, setMode] = useState("create"); // or 'edit'
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const showToast = useToast();
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
    // Validação de data: não permitir data futura
    if (!form.dateAchieved) {
      showToast({ type: 'error', message: 'Informe a data da conquista' });
      return;
    }
    const d = new Date(form.dateAchieved);
    const today = new Date();
    today.setHours(0,0,0,0);
    d.setHours(0,0,0,0);
    if (d > today) {
      showToast({ type: 'error', message: 'A data não pode ser futura' });
      return;
    }

    setSaving(true);
    try {
      if (mode === "edit" && editId) {
        await api.put(`/achievements/${editId}`, {
          achievementTypeId: form.achievementTypeId,
          dateAchieved: form.dateAchieved,
          notes: form.notes,
        });
        setMode("create");
        setEditId(null);
        showToast({ type: 'success', message: 'Conquista atualizada' });
      } else {
        await api.post("/achievements", {
          userId: user.id,
          achievementTypeId: form.achievementTypeId,
          dateAchieved: form.dateAchieved,
          notes: form.notes,
        });
        showToast({ type: 'success', message: 'Conquista registrada' });
      }
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', message: err.response?.data?.error || 'Erro ao salvar' });
      setSaving(false);
      return;
    } finally {
      setSaving(false);
    }
    setForm({ achievementTypeId: "", dateAchieved: "", notes: "" });
    await load();
  }

  useEffect(() => {
    load();
  }, [user?.id]);

  async function startEdit(r) {
    setMode("edit");
    setEditId(r.id);
    setForm({
      achievementTypeId: r.achievementTypeId,
      dateAchieved: r.dateAchieved?.slice(0,10) || "",
      notes: r.notes || "",
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deleteAchievement(id) {
    if (!confirm('Confirma exclusão desta conquista?')) return;
    try {
      await api.delete(`/achievements/${id}`);
      await load();
      showToast({ type: 'success', message: 'Conquista excluída' });
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', message: err.response?.data?.error || 'Erro ao excluir' });
    }
  }

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
                disabled={saving}
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
                disabled={saving}
              />
              <Label active={!focus.notes || form.notes || focus.notes}>Observações</Label>
            </InputWrapper>

            <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : (mode === 'edit' ? 'Salvar Alteração' : 'Salvar')}</Button>
          </form>
        </Card>

        <Card style={{ marginTop: 16 }}>
          <Subtitle>Minhas conquistas</Subtitle>
          <List>
            {regs.map((r) => (
              <ListItem key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{r.AchievementType?.name || r.achievementTypeId}</strong>
                  <div style={{ fontSize: 12, color: '#666' }}>{r.dateAchieved}</div>
                </div>
                <div>
                  {(user?.role === 'admin' || r.userId === user?.id) && (
                    <>
                      <Button onClick={() => startEdit(r)} style={{ marginRight: 8 }}>Editar</Button>
                      <Button onClick={() => deleteAchievement(r.id)} style={{ background: '#dc3545' }}>Excluir</Button>
                    </>
                  )}
                </div>
              </ListItem>
            ))}
          </List>
        </Card>
      </div>
    </Section>
  );
}
