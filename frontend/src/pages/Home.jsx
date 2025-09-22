import React, { useState } from "react";
import styled from "styled-components";
import { useAuth } from "../auth/context.jsx";
import { Titulo } from "../styles/Titulo.jsx";

const Section = styled.section`
  //padding: 24px;
`;
const Card = styled.div`
  //max-width: 420px;
  padding: 14px;
  //border: 1px solid #eee;
  //border-radius: 12px;
  //margin-top: 16px;
  //background-image: linear-gradient(90deg, #3e0703 50%, #8c1007);
  display: flex;
  flex-direction: column;
  text-align: center;
  width: 100vw;
  height: 100vh;
`;

export default function Home() {
  const { login, register, user } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  async function submit(e) {
    e.preventDefault();
    if (mode === "login") await login(form.email, form.password);
    else await register(form.name, form.email, form.password);
  }

  return (
    <Section>
      <Card>
        <Titulo cor={"#ff0000ff"} tamanhoFonte={"36px"}>
          Clube de Aventureiros
        </Titulo>
        <Titulo cor={"#ff0000ff"} tamanhoFonte={"36px"}>
          Luzeiros do Prado
        </Titulo>
        <p>Bem-vindo! Acesse sua conta para registrar conquistas.</p>
      </Card>
    </Section>
  );
}
