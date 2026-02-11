import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAuth } from "../auth/context.jsx";
import api from "../lib/api.js";
import { Section, Card } from "../styles/components";
import Titulo from "../styles/Titulo.jsx";

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;

const StatCard = styled(Card)`
  text-align: center;
  padding: 24px;
  background: linear-gradient(135deg, ${props => props.theme.primaryColor}20 0%, ${props => props.theme.primaryColor}05 100%);
  border: 1px solid ${props => props.theme.primaryColor}30;

  h3 {
    color: ${props => props.theme.primaryColor};
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0 0 12px 0;
  }

  .value {
    font-size: 32px;
    font-weight: bold;
    color: ${props => props.theme.primaryColor};
    margin: 0;
  }
`;

const RecentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const RecentItem = styled.div`
  padding: 12px;
  border-left: 4px solid ${props => props.theme.primaryColor};
  background: ${props => props.theme.primaryColor}08;
  border-radius: 4px;

  .user-name {
    font-weight: 600;
    color: ${props => props.theme.textColor};
  }

  .achievement-name {
    color: ${props => props.theme.primaryColor};
    font-size: 14px;
    margin-top: 4px;
  }

  .date {
    color: #999;
    font-size: 12px;
    margin-top: 4px;
  }
`;

const RankingTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;

  th {
    background: ${props => props.theme.primaryColor}15;
    padding: 12px;
    text-align: left;
    font-weight: 600;
    color: ${props => props.theme.primaryColor};
    border-bottom: 2px solid ${props => props.theme.primaryColor}30;
    font-size: 12px;
    text-transform: uppercase;
  }

  td {
    padding: 12px;
    border-bottom: 1px solid ${props => props.theme.primaryColor}15;

    &:first-child {
      font-weight: 600;
      color: ${props => props.theme.primaryColor};
      width: 50px;
    }

    &.name {
      font-weight: 500;
    }

    &.points {
      color: ${props => props.theme.primaryColor};
      font-weight: 600;
    }
  }

  tr:hover {
    background: ${props => props.theme.primaryColor}08;
  }
`;

const LoadingText = styled.p`
  color: #999;
  text-align: center;
  padding: 32px 0;
`;

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [statsRes, recentRes, rankingRes] = await Promise.all([
          api.get("/stats"),
          api.get("/stats/recent"),
          api.get("/stats/ranking"),
        ]);

        setStats(statsRes.data);
        setRecent(recentRes.data || []);
        setRanking(rankingRes.data || []);
      } catch (err) {
        console.error("Erro ao carregar dados da home:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <Section>
        <Titulo>Bem-vindo ao Clube dos Luzeiros</Titulo>
        <LoadingText>Carregando estatísticas...</LoadingText>
      </Section>
    );
  }

  const displayName = user?.nickname || user?.name || "Aventureiro";

  return (
    <Section>
      <Titulo>Bem-vindo, {displayName}! 🌟</Titulo>

      {/* Estatísticas Gerais */}
      {stats && (
        <StatsContainer>
          <StatCard>
            <h3>Usuários Ativos</h3>
            <p className="value">{stats.totalUsers}</p>
          </StatCard>
          <StatCard>
            <h3>Total de Conquistas</h3>
            <p className="value">{stats.totalAchievements}</p>
          </StatCard>
          <StatCard>
            <h3>Média por Usuário</h3>
            <p className="value">{stats.avgAchievementsPerUser}</p>
          </StatCard>
        </StatsContainer>
      )}

      {/* Conquistas Recentes */}
      <Card>
        <Titulo style={{ fontSize: "18px", marginTop: 0 }}>Conquistas Recentes</Titulo>
        {recent.length > 0 ? (
          <RecentList>
            {recent.map((ach) => (
              <RecentItem key={ach.id}>
                <div className="user-name">
                  {ach.User?.nickname || ach.User?.name}
                </div>
                <div className="achievement-name">
                  {ach.AchievementType?.name} +{ach.AchievementType?.points} pts
                </div>
                <div className="date">
                  {new Date(ach.dateAchieved).toLocaleDateString("pt-BR")}
                </div>
              </RecentItem>
            ))}
          </RecentList>
        ) : (
          <LoadingText>Nenhuma conquista registrada ainda</LoadingText>
        )}
      </Card>

      {/* Ranking */}
      <Card style={{ marginTop: "24px" }}>
        <Titulo style={{ fontSize: "18px", marginTop: 0 }}>
          🏆 Ranking Top 10
        </Titulo>
        {ranking.length > 0 ? (
          <RankingTable>
            <thead>
              <tr>
                <th>Pos</th>
                <th>Usuário</th>
                <th style={{ textAlign: "right" }}>Conquistas</th>
                <th style={{ textAlign: "right" }}>Pontos</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((user) => (
                <tr key={user.id}>
                  <td>#{user.rank}</td>
                  <td className="name">{user.nickname || user.name}</td>
                  <td style={{ textAlign: "right" }}>{user.totalAchievements}</td>
                  <td className="points" style={{ textAlign: "right" }}>
                    {user.totalPoints}
                  </td>
                </tr>
              ))}
            </tbody>
          </RankingTable>
        ) : (
          <LoadingText>Nenhum ranking disponível</LoadingText>
        )}
      </Card>
    </Section>
  );
}
