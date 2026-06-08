import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native'; // <-- Adicionado para atualizar ao focar na tela
import { useCallback, useState } from 'react'; // <-- Trocamos useEffect por useCallback
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { apiUrl } from '../../services/api';
import styles from './styles';

export default function Dashboard({ navigation }) { 
  const [nomeAluno, setNomeAluno] = useState('Aluno');
  const [horasAprovadas, setHorasAprovadas] = useState(0);
  const [horasEmAnalise, setHorasEmAnalise] = useState(0);
  const [loading, setLoading] = useState(true);

  // --- A MÁGICA DA ATUALIZAÇÃO ---
  // Roda sempre que a tela ganha foco (quando você clica na aba Dashboard)
  useFocusEffect(
    useCallback(() => {
      carregarDadosDoDashboard();
    }, [])
  );

  const carregarDadosDoDashboard = async () => {
    try {
      // 1. Buscando o nome do aluno no AsyncStorage
      const userString = await AsyncStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        // Pega apenas o primeiro nome para ficar amigável (ex: "Juliana")
        if (user.nome) {
          setNomeAluno(user.nome.split(' ')[0]);
        }
      }

      // 2. Buscando o histórico para somar as horas
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(apiUrl('/api/alunos/atividades'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        let somaAprovadas = 0;
        let somaEmAnalise = 0;

        // Passa por todas as atividades que voltaram do banco
        data.forEach(atividade => {
          const horas = Number(atividade.cargaHoraria || atividade.cargaHorariaInformada) || 0;
          const status = String(atividade.status || '').trim().toLowerCase();

          if (status === 'aprovado' || status === 'aprovada') {
            somaAprovadas += horas;
          } else if (
            status === 'pendente' ||
            status === 'em análise' ||
            status === 'em analise' ||
            status === 'enviada' ||
            status === 'enviado'
          ) {
            somaEmAnalise += horas;
          }
        });

        // Atualiza a tela com os valores reais calculados
        setHorasAprovadas(somaAprovadas);
        setHorasEmAnalise(somaEmAnalise);
      }
    } catch (error) {
      console.log('Erro ao carregar o dashboard:', error);
    } finally {
      setLoading(false); // Tira a bolinha de carregamento
    }
  };

  // --- FUNÇÃO DE SAIR (LOGOUT) ---
  const handleLogout = () => {
    Alert.alert(
      "Sair do KORE",
      "Tem certeza que deseja sair?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sim", 
          onPress: async () => {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            navigation.replace('Login'); 
          }
        }
      ]
    );
  };

  // Enquanto estiver calculando, mostra um "loading" na tela
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#00B7B8" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.welcomeText}>Olá, {nomeAluno}</Text>
      <Text style={styles.subtitle}>Acompanhe o seu progresso de horas complementares.</Text>

      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Horas Aprovadas</Text>
          <Text style={styles.cardNumber}>{horasAprovadas}h</Text>
        </View>
        
        <View style={[styles.card, styles.cardPending]}>
          <Text style={styles.cardTitle}>Em Análise</Text>
          <Text style={[styles.cardNumber, styles.textPending]}>{horasEmAnalise}h</Text>
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