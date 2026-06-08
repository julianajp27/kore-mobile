import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Text, View } from 'react-native';
import styles from './styles';

export default function Listagem() {
  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarAtividades();
  }, []);

  const carregarAtividades = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      const response = await fetch('https://sistema-gestao-atividades-complementares.onrender.com/api/atividades', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Passando o token de segurança
        }
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Erro', data.message || 'Não foi possível carregar as atividades.');
        return;
      }

      setAtividades(data); // Salva os dados reais vindos do MongoDB
    } catch (error) {
      Alert.alert('Erro', 'Falha na conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <View>
        <Text style={styles.itemTitle}>{item.titulo}</Text>
        <Text style={styles.itemHours}>{item.cargaHoraria} horas</Text> 
      </View>
      <View style={[styles.badge, item.status === 'Aprovado' ? styles.badgeApproved : styles.badgePending]}>
        <Text style={styles.badgeText}>{item.status}</Text>
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
        keyExtractor={item => item._id} // O MongoDB usa _id
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#64748b' }}>Nenhuma atividade submetida ainda.</Text>}
      />
    </View>
  );
}