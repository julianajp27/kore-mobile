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

function obterMetaHoras(user, curso) {
  return Number(
    curso?.cargaHorariaTotalComplementar ||
    user?.curso?.cargaHorariaTotalComplementar ||
    user?.cursoId?.cargaHorariaTotalComplementar ||
    user?.cargaHorariaTotalComplementar ||
    100
  );
}

function obterIdCurso(curso) {
  return curso?._id || curso?.id || '';
}

export default function Dashboard({ navigation }) {
  const [nomeAluno, setNomeAluno] = useState('Aluno');
  const [cursos, setCursos] = useState([]);
  const [cursoId, setCursoId] = useState('');
  const [cursoAberto, setCursoAberto] = useState(false);
  const [horasAprovadas, setHorasAprovadas] = useState(0);
  const [horasEmAnalise, setHorasEmAnalise] = useState(0);
  const [totalAtividades, setTotalAtividades] = useState(0);
  const [reprovadas, setReprovadas] = useState(0);
  const [metaHoras, setMetaHoras] = useState(100);
  const [loading, setLoading] = useState(true);

  const carregarDadosDoDashboard = useCallback(async (cursoSelecionadoId = '') => {
    try {
      setLoading(true);

      const userString = await AsyncStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : {};

      if (user.nome) setNomeAluno(user.nome.split(' ')[0]);

      const token = await AsyncStorage.getItem('token');

      const cursosResponse = await fetch(apiUrl('/api/alunos/meus-cursos'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const cursosData = await cursosResponse.json();

      if (!cursosResponse.ok) {
        Alert.alert('Erro', cursosData.message || 'Não foi possível carregar seus cursos.');
        return;
      }

      const cursosLista = Array.isArray(cursosData) ? cursosData : cursosData.cursos || cursosData.data || [];
      const cursoSalvo = await AsyncStorage.getItem('dashboardCursoId');
      const cursoPreferidoId = cursoSelecionadoId || cursoSalvo;
      const cursoPreferidoPermitido = cursosLista.some((curso) =>
        String(obterIdCurso(curso)) === String(cursoPreferidoId)
      );
      const cursoEscolhidoId = cursoPreferidoPermitido
        ? cursoPreferidoId
        : obterIdCurso(cursosLista[0]);
      const cursoEscolhido = cursosLista.find((curso) => String(obterIdCurso(curso)) === String(cursoEscolhidoId));

      setCursos(cursosLista);
      setCursoId(cursoEscolhidoId || '');
      setMetaHoras(obterMetaHoras(user, cursoEscolhido));

      const endpointAtividades = cursoEscolhidoId
        ? `/api/alunos/atividades?cursoId=${encodeURIComponent(cursoEscolhidoId)}`
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
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarDadosDoDashboard(cursoId);
    }, [carregarDadosDoDashboard, cursoId])
  );

  const cursoSelecionado = cursos.find((curso) => String(obterIdCurso(curso)) === String(cursoId));

  const selecionarCurso = async (novoCursoId) => {
    setCursoId(novoCursoId);
    setCursoAberto(false);
    await AsyncStorage.setItem('dashboardCursoId', String(novoCursoId));
  };

  const handleLogout = () => {
    Alert.alert('Sair do KORE', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sim',
        onPress: async () => {
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
          await AsyncStorage.removeItem('dashboardCursoId');
          navigation.replace('Login');
        }
      }
    ]);
  };

  const progresso = metaHoras > 0
    ? Math.min(100, Math.round((horasAprovadas / metaHoras) * 100))
    : 0;

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

      <Text style={styles.selectorLabel}>Curso</Text>
      <TouchableOpacity
        style={styles.courseSelect}
        onPress={() => setCursoAberto(!cursoAberto)}
      >
        <View style={styles.courseSelectTextBox}>
          <Text style={[styles.courseSelectText, !cursoSelecionado && styles.coursePlaceholder]}>
            {cursoSelecionado ? cursoSelecionado.nome : 'Selecionar curso'}
          </Text>
          {cursoSelecionado?.codigo ? (
            <Text style={styles.courseSelectMeta}>{cursoSelecionado.codigo}</Text>
          ) : null}
        </View>
        <Text style={styles.courseChevron}>{cursoAberto ? '^' : 'v'}</Text>
      </TouchableOpacity>

      {cursoAberto ? (
        <View style={styles.courseList}>
          {cursos.length ? cursos.map((curso) => {
            const id = obterIdCurso(curso);
            const selecionado = String(id) === String(cursoId);

            return (
              <TouchableOpacity
                key={id}
                style={[styles.courseOption, selecionado && styles.courseOptionSelected]}
                onPress={() => selecionarCurso(id)}
              >
                <Text style={[styles.courseOptionTitle, selecionado && styles.courseOptionTitleSelected]}>
                  {curso.nome}
                </Text>
                <Text style={[styles.courseOptionMeta, selecionado && styles.courseOptionMetaSelected]}>
                  {curso.codigo || `${curso.cargaHorariaTotalComplementar || metaHoras}h complementares`}
                </Text>
              </TouchableOpacity>
            );
          }) : (
            <Text style={styles.emptyCourseText}>Nenhum curso vinculado ao aluno.</Text>
          )}
        </View>
      ) : null}

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
