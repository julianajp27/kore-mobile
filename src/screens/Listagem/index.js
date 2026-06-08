import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { apiUrl } from '../../services/api';
import styles from './styles';

export default function Listagem({ navigation }) { 
  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(true); 
      carregarAtividades();
    }, [])
  );

  const carregarAtividades = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      const response = await fetch(apiUrl('/api/alunos/atividades'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Erro', data.message || 'Não foi possível carregar as atividades.');
        return;
      }

      setAtividades(data.reverse()); 

    } catch (error) {
      Alert.alert('Erro', 'Falha na conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

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

  const renderItem = ({ item }) => {
    const isAprovado = item.status === 'Aprovado' || item.status === 'Aprovada';

    return (
      <View style={styles.itemCard}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle} numberOfLines={2}>{item.titulo}</Text>
          <Text style={styles.itemHours}>{item.cargaHoraria} horas</Text> 
        </View>
        <View style={[styles.badge, isAprovado ? styles.badgeApproved : styles.badgePending]}>
          <Text style={[styles.badgeText, isAprovado ? styles.badgeTextApproved : styles.badgeTextPending]}>
            {item.status || 'Pendente'}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#00B7B8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={atividades}
        keyExtractor={item => item._id} 
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma atividade submetida ainda.</Text>}
      />

      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>Sair do Sistema</Text>
      </TouchableOpacity>
    </View>
  );
}