import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
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

function labelStatus(status) {
  const normalizado = normalizarStatus(status);

  if (normalizado === 'aprovada') return 'Aprovada';
  if (normalizado === 'reprovada') return 'Reprovada';

  return 'Em análise';
}

function obterHoras(item) {
  return item.cargaHorariaValidada || item.cargaHorariaInformada || item.cargaHoraria || 0;
}

function obterCategoria(item) {
  return item.categoriaId?.nome || item.categoria?.nome || item.categoria || 'Categoria não informada';
}

function obterJustificativa(item) {
  return (
    item.justificativaReprovacao ||
    item.justificativa ||
    item.motivoReprovacao ||
    item.observacaoCoordenador ||
    item.observacao ||
    ''
  );
}

export default function Listagem({ navigation }) {
  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      carregarAtividades();
    }, [])
  );

  const carregarAtividades = async () => {
    try {
      setLoading(true);

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
        Alert.alert('Erro', data.message || 'Não foi possível carregar as atividades.');
        return;
      }

      setAtividades(normalizarLista(data).slice().reverse());
    } catch (error) {
      Alert.alert('Erro', 'Falha na conexão com o servidor.');
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

  const renderItem = ({ item }) => {
    const status = normalizarStatus(item.status);
    const justificativa = obterJustificativa(item);

    return (
      <View style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>{item.titulo || 'Atividade sem título'}</Text>
            <Text style={styles.itemCategory}>{obterCategoria(item)}</Text>
            <Text style={styles.itemHours}>{obterHoras(item)} horas</Text>
          </View>

          <View style={[
            styles.badge,
            status === 'aprovada' && styles.badgeApproved,
            status === 'reprovada' && styles.badgeRejected,
            status === 'pendente' && styles.badgePending
          ]}>
            <Text style={[
              styles.badgeText,
              status === 'aprovada' && styles.badgeTextApproved,
              status === 'reprovada' && styles.badgeTextRejected,
              status === 'pendente' && styles.badgeTextPending
            ]}>
              {labelStatus(item.status)}
            </Text>
          </View>
        </View>

        {status === 'reprovada' && justificativa ? (
          <View style={styles.rejectionBox}>
            <Text style={styles.rejectionLabel}>Justificativa</Text>
            <Text style={styles.rejectionText}>{justificativa}</Text>
          </View>
        ) : null}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00B7B8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={atividades}
        keyExtractor={(item, index) => item._id || String(index)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.pageTitle}>Certificados</Text>
            <Text style={styles.subtitle}>Acompanhe o status das suas submissões.</Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhuma atividade submetida ainda.</Text>
        }
      />

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sair do Sistema</Text>
      </TouchableOpacity>
    </View>
  );
}
