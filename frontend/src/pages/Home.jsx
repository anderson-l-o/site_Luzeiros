import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAuth } from "../auth/context.jsx";
import api from "../lib/api.js";
import {
  Section,
  Card,
  Title,
} from "../styles/components";

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;

const StatCard = styled(Card)`
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, ${props => props.theme.primaryColor}15 0%, ${props => props.theme.primaryColor}05 100%);
  border: 1px solid ${props => props.theme.primaryColor}30;

  h3 {
    color: ${props => props.theme.primaryColor};
    font-size: 12px;
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
    font-size: 14px;
  }

  .achievement-name {
    color: ${props => props.theme.primaryColor};
    font-size: 13px;
    margin-top: 4px;
    font-weight: 500;
  }

  .date {
    color: #999;
    font-size: 11px;
    margin-top: 4px;
  }
`;

const RankingTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;

  th {
    background: ${props => props.theme.primaryColor}15;
    padding: 10px 12px;
    text-align: left;
    font-weight: 600;
    color: ${props => props.theme.primaryColor};
    border-bottom: 2px solid ${props => props.theme.primaryColor}30;
    font-size: 11px;
    text-transform: uppercase;
  }

  td {
    padding: 10px 12px;
    border-bottom: 1px solid ${props => props.theme.primaryColor}15;
    font-size: 14px;

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
      text-align: right;
    }

    &.achievements {
      text-align: right;
    }
  }

  tr:hover {
    background: ${props => props.theme.primaryColor}08;
  }
`;

const LoadingText = styled.p`
  color: #999;
  text-align: center;
  padding: 24px 0;
  font-size: 14px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 32px 16px;
  color: #999;

  p {
    margin: 0;
    font-size: 14px;
  }
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
        <Title>Bem-vindo ao Clube dos Luzeiros</Title>
        <LoadingText>Carregando estatísticas...</LoadingText>
      </Section>
    );
  }

  const displayName = user?.nickname || user?.name || "Aventureiro";

  return (
    <Section>
      <Title>Bem-vindo, {displayName}! 🌟</Title>

      {/* Estatísticas Gerais */}
      {stats && (
        <StatsGrid>
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
        </StatsGrid>
      )}

      {/* Conquistas Recentes */}
      <Card>
        <Title style={{ fontSize: "16px", marginTop: 0, marginBottom: "12px" }}>
          Conquistas Recentes
        </Title>
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
          <EmptyState>
            <p>Nenhuma conquista registrada ainda</p>
          </EmptyState>
        )}
      </Card>

      {/* Ranking */}
      <Card style={{ marginTop: "24px" }}>
        <Title style={{ fontSize: "16px", marginTop: 0, marginBottom: "12px" }}>
          🏆 Ranking Top 10
        </Title>
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
              {ranking.map((userRank) => (
                <tr key={userRank.id}>
                  <td>#{userRank.rank}</td>
                  <td className="name">{userRank.nickname || userRank.name}</td>
                  <td className="achievements">{userRank.totalAchievements}</td>
                  <td className="points">{userRank.totalPoints}</td>
                </tr>
              ))}
            </tbody>
          </RankingTable>
        ) : (
          <EmptyState>
            <p>Nenhum ranking disponível</p>
          </EmptyState>
        )}
      </Card>
    </Section>
  );
}
