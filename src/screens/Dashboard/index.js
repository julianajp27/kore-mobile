import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { apiUrl } from '../../services/api';
import styles from './styles';

// --- FUNÇÕES AJUDANTES (Para evitar os erros de 'not defined') ---
const obterMetaHoras = (user) => {
  // Se a Renata mandar a meta do aluno no banco, usamos ela. Se não, o padrão é 100.
  return user?.metaHoras || 100; 
};

const normalizarLista = (data) => {
  // Garante que o aplicativo não quebre se a API não devolver uma lista (array)
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.atividades)) return data.atividades;
  return [];
};

const normalizarStatus = (status) => {
  // Padroniza as palavras para não dar erro se a Renata digitar maiúsculo/minúsculo no banco
  if (!status) return 'pendente';
  const s = status.toLowerCase().trim();
  if (s.includes('aprovad')) return 'aprovada';
  if (s.includes('reprovad') || s.includes('recusad')) return 'reprovada';
  return 'pendente';
};

const obterHorasAprovadas = (atividade) => {
  // Pega as horas validadas (se existirem) ou a carga horária informada
  return Number(atividade.horasValidadas || atividade.cargaHoraria || atividade.cargaHorariaInformada) || 0;
};

const obterHorasPendentes = (atividade) => {
  return Number(atividade.cargaHoraria || atividade.cargaHorariaInformada) || 0;
};
// -----------------------------------------------------------------


export default function Dashboard({ navigation }) { 
  const [nomeAluno, setNomeAluno] = useState('Aluno');
  const [horasAprovadas, setHorasAprovadas] = useState(0);
  const [horasEmAnalise, setHorasEmAnalise] = useState(0);
  const [totalAtividades, setTotalAtividades] = useState(0);
  const [reprovadas, setReprovadas] = useState(0);
  const [metaHoras, setMetaHoras] = useState(100);
  const [loading, setLoading] = useState(true);

  // --- A MÁGICA DA ATUALIZAÇÃO ---
  useFocusEffect(
    useCallback(() => {
      carregarDadosDoDashboard();
    }, [])
  );

  const carregarDadosDoDashboard = async () => {
    try {
      setLoading(true);

      const userString = await AsyncStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : {};

      if (user.nome) setNomeAluno(user.nome.split(' ')[0]);
      setMetaHoras(obterMetaHoras(user));

      const token = await AsyncStorage.getItem('token');

      const response = await fetch(apiUrl('/api/alunos/atividades'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Erro', data.message || 'Não foi possível carregar o dashboard.');
        return;
      }

      const atividades = normalizarLista(data);
      let aprovadasHoras = 0;
      let pendentesHoras = 0;
      let qtdReprovadas = 0;

      atividades.forEach((atividade) => {
        const status = normalizarStatus(atividade.status);

        if (status === 'aprovada') {
          aprovadasHoras += obterHorasAprovadas(atividade);
        }

        if (status === 'pendente') {
          pendentesHoras += obterHorasPendentes(atividade);
        }

        if (status === 'reprovada') {
          qtdReprovadas += 1;
        }
      });

      setTotalAtividades(atividades.length);
      setHorasAprovadas(aprovadasHoras);
      setHorasEmAnalise(pendentesHoras);
      setReprovadas(qtdReprovadas);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar dados do dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sair do KORE', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sim',
        onPress: async () => {
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
          navigation.replace('Login');
        }
      }
    ]);
  };

  const progresso = Math.min(100, Math.round((horasAprovadas / metaHoras) * 100));

  if (loading) {
    return (
      <View style={styles.loadingContainer || [styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#00B7B8" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Olá, {nomeAluno}</Text>
      <Text style={styles.subtitle}>Acompanhe suas atividades complementares.</Text>

      <View style={styles.summaryCard}>
        <View>
          <Text style={styles.summaryLabel}>Progresso aprovado</Text>
          <Text style={styles.summaryValue}>{horasAprovadas}h</Text>
          <Text style={styles.summaryMeta}>de {metaHoras}h necessárias</Text>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progresso}%` }]} />
        </View>

        <Text style={styles.progressText}>{progresso}% concluído</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Em análise</Text>
          <Text style={styles.statValueWarning}>{horasEmAnalise}h</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Reprovadas</Text>
          <Text style={styles.statValueDanger}>{reprovadas}</Text>
        </View>

        <View style={styles.statCardFull}>
          <Text style={styles.statLabel}>Atividades enviadas</Text>
          <Text style={styles.statValue}>{totalAtividades}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={{ marginTop: 30, marginBottom: 20, marginHorizontal: 20, alignItems: 'center', padding: 15, backgroundColor: '#FFEBEB', borderRadius: 8 }} 
        onPress={handleLogout}
      >
        <Text style={{ color: '#D9534F', fontWeight: 'bold', fontSize: 16 }}>Sair do Sistema</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}