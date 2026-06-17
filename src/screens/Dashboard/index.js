import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { apiUrl } from '../../services/api';
import styles from './styles';

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
  return Number(atividade.cargaHorariaValidada || 0);
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
  const [nomeAluno, setNomeAluno] = useState('Aluno');
  const [horasAprovadas, setHorasAprovadas] = useState(0);
  const [horasEmAnalise, setHorasEmAnalise] = useState(0);
  const [totalAtividades, setTotalAtividades] = useState(0);
  const [reprovadas, setReprovadas] = useState(0);
  const [metaHoras, setMetaHoras] = useState(100);
  const [loading, setLoading] = useState(true);

  // Novos estados para controlar a seleção de cursos
  const [cursoId, setCursoId] = useState('');
  const [cursos, setCursos] = useState([]);
  const [cursoAberto, setCursoAberto] = useState(false);

  useFocusEffect(
    useCallback(() => {
      carregarDadosDoDashboard();
    }, [cursoId]) // Atualiza sempre que o cursoId mudar
  );

  const carregarDadosDoDashboard = async () => {
    try {
      setLoading(true);

      const userString = await AsyncStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : {};

      if (user.nome) setNomeAluno(user.nome.split(' ')[0]);
      setMetaHoras(obterMetaHoras(user));

      const token = await AsyncStorage.getItem('token');

      // 1. Busca os cursos do aluno
      const categoriasResponse = await fetch(apiUrl('/api/alunos/categorias'), {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      });

      let currentCursoId = cursoId;

      if (categoriasResponse.ok) {
        const categoriasData = await categoriasResponse.json();
        const cursosRecebidos = Array.isArray(categoriasData.cursos) ? categoriasData.cursos : [];
        setCursos(cursosRecebidos);
        
        // Define o primeiro curso como padrão se não houver nenhum selecionado
        if (!currentCursoId && cursosRecebidos.length > 0) {
          currentCursoId = categoriasData.cursoId || cursosRecebidos[0]._id || cursosRecebidos[0].id;
          setCursoId(currentCursoId);
        }
      }

      // 2. Busca as atividades filtrando pelo curso selecionado
      const endpointAtividades = currentCursoId 
        ? `/api/alunos/atividades?cursoId=${encodeURIComponent(currentCursoId)}` 
        : '/api/alunos/atividades';

      const response = await fetch(apiUrl(endpointAtividades), {
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
    } catch (_error) {
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00B7B8" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Olá, {nomeAluno}</Text>
      <Text style={styles.subtitle}>Acompanhe suas atividades complementares.</Text>

      {/* Bloco de Seleção de Curso (Aparece apenas se houver > 1 curso) */}
      {cursos.length > 1 && (
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.summaryLabel}>Curso selecionado</Text>
          <TouchableOpacity
            style={styles.statCardFull}
            onPress={() => setCursoAberto(!cursoAberto)}
          >
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>
              {cursos.find((c) => String(c._id || c.id) === String(cursoId))?.nome || 'Selecionar curso'}
            </Text>
          </TouchableOpacity>

          {cursoAberto && (
            <View style={[styles.statCardFull, { marginTop: 8, paddingVertical: 5 }]}>
              {cursos.map((curso, index) => {
                const id = curso._id || curso.id;
                const isLast = index === cursos.length - 1;
                return (
                  <TouchableOpacity
                    key={id}
                    style={{ 
                      paddingVertical: 12, 
                      paddingHorizontal: 10,
                      borderBottomWidth: isLast ? 0 : 1, 
                      borderBottomColor: '#eee' 
                    }}
                    onPress={() => {
                      setCursoId(id);
                      setCursoAberto(false);
                    }}
                  >
                    <Text style={{ fontSize: 16, color: '#555' }}>{curso.nome}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      )}

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Progresso aprovado</Text>
        <Text style={styles.summaryValue}>{horasAprovadas}h</Text>
        <Text style={styles.summaryMeta}>de {metaHoras}h necessárias</Text>

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

      <TouchableOpacity style={styles.primaryLink} onPress={() => navigation.navigate('Certificados')}>
        <Text style={styles.primaryLinkText}>Ver certificados</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sair do Sistema</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}