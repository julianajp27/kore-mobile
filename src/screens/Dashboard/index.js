import AsyncStorage from '@react-native-async-storage/async-storage';
<<<<<<< HEAD
import { useFocusEffect } from '@react-navigation/native'; // <-- Adicionado para atualizar ao focar na tela
import { useCallback, useState } from 'react'; // <-- Trocamos useEffect por useCallback
=======
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
>>>>>>> e7b22ee16ea72d27fe77cf128aa8771af80427ed
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { apiUrl } from '../../services/api';
import styles from './styles';

<<<<<<< HEAD
export default function Dashboard({ navigation }) { 
=======
function normalizarLista(data) {
  if (Array.isArray(data)) return data;
  return data?.atividades || data?.data || [];
}

function normalizarStatus(status) {
  const s = String(status || '').trim().toLowerCase();

  if (['aprovada', 'aprovado', 'aprovacao', 'aprovação'].includes(s)) return 'aprovada';
  if (['reprovada', 'reprovado', 'reprovacao', 'reprovação'].includes(s)) return 'reprovada';
  if (['pendente', 'enviada', 'enviado', 'em análise', 'em analise'].includes(s)) return 'pendente';

  return 'pendente';
}

function obterHorasAprovadas(atividade) {
  return Number(
    atividade.cargaHorariaValidada ||
    atividade.cargaHoraria ||
    atividade.cargaHorariaInformada ||
    0
  );
}

function obterHorasPendentes(atividade) {
  return Number(
    atividade.cargaHorariaInformada ||
    atividade.cargaHoraria ||
    0
  );
}

function obterMetaHoras(user) {
  return Number(
    user?.curso?.cargaHorariaTotalComplementar ||
    user?.cursoId?.cargaHorariaTotalComplementar ||
    user?.cargaHorariaTotalComplementar ||
    100
  );
}

export default function Dashboard({ navigation }) {
>>>>>>> e7b22ee16ea72d27fe77cf128aa8771af80427ed
  const [nomeAluno, setNomeAluno] = useState('Aluno');
  const [horasAprovadas, setHorasAprovadas] = useState(0);
  const [horasEmAnalise, setHorasEmAnalise] = useState(0);
  const [totalAtividades, setTotalAtividades] = useState(0);
  const [reprovadas, setReprovadas] = useState(0);
  const [metaHoras, setMetaHoras] = useState(100);
  const [loading, setLoading] = useState(true);

<<<<<<< HEAD
  // --- A MÁGICA DA ATUALIZAÇÃO ---
  // Roda sempre que a tela ganha foco (quando você clica na aba Dashboard)
=======
>>>>>>> e7b22ee16ea72d27fe77cf128aa8771af80427ed
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

  // --- FUNÇÃO DE SAIR (LOGOUT) ---
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
      <View style={styles.loadingContainer}>
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

<<<<<<< HEAD
      <TouchableOpacity 
        style={{ marginTop: 30, marginBottom: 20, marginHorizontal: 20, alignItems: 'center', padding: 15, backgroundColor: '#FFEBEB', borderRadius: 8 }} 
        onPress={handleLogout}
      >
        <Text style={{ color: '#D9534F', fontWeight: 'bold', fontSize: 16 }}>Sair do Sistema</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
=======
      <TouchableOpacity style={styles.primaryLink} onPress={() => navigation.navigate('Listagem')}>
        <Text style={styles.primaryLinkText}>Ver certificados</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sair do Sistema</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
>>>>>>> e7b22ee16ea72d27fe77cf128aa8771af80427ed
