import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native'; // <-- Nova importação mágica das rotas
import { useCallback, useState } from 'react'; // <-- Mudamos a importação aqui
import { ActivityIndicator, Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { apiUrl } from '../../services/api';
import styles from './styles';

export default function Listagem({ navigation }) { 
  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- A MÁGICA ACONTECE AQUI ---
  // Troca o useEffect por useFocusEffect para recarregar sempre que a tela abrir
  useFocusEffect(
    useCallback(() => {
      setLoading(true); // Faz a bolinha girar de novo para dar feedback visual
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

      // Se a Renata mandar os itens mais antigos primeiro, podemos inverter a lista
      // usando data.reverse() para o item novo aparecer no topo!
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

  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <View>
        <Text style={styles.itemTitle}>{item.titulo}</Text>
        <Text style={styles.itemHours}>{item.cargaHoraria} horas</Text> 
      </View>
      <View style={[styles.badge, (item.status === 'Aprovado' || item.status === 'Aprovada') ? styles.badgeApproved : styles.badgePending]}>
        <Text style={styles.badgeText}>{item.status || 'Pendente'}</Text>
      </View>
    </View>
  );

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
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#64748b' }}>Nenhuma atividade submetida ainda.</Text>}
      />

      <TouchableOpacity 
        style={{ marginHorizontal: 20, marginBottom: 20, alignItems: 'center', padding: 15, backgroundColor: '#FFEBEB', borderRadius: 8 }} 
        onPress={handleLogout}
      >
        <Text style={{ color: '#D9534F', fontWeight: 'bold', fontSize: 16 }}>Sair do Sistema</Text>
      </TouchableOpacity>
    </View>
  );
}