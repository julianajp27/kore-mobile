import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native'; // <-- Adicionado ActivityIndicator
import { apiUrl } from '../../services/api';
import styles from './styles';

import CustomButton from '../../components/CustomButton';
import CustomInput from '../../components/CustomInput';

export default function Envio({ navigation }) {
  // --- ESTADO DE CARREGAMENTO NOVO ---
  const [loading, setLoading] = useState(false);

  const [titulo, setTitulo] = useState('');
  const [horas, setHoras] = useState('');
  const [arquivo, setArquivo] = useState(null);

  const handleSelecionarArquivo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setArquivo(result.assets[0]);
      }
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível selecionar o arquivo.');
    }
  };

  const handleTirarFoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão Negada', 'Precisamos de acesso à câmera para tirar a foto do certificado.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true, // <-- Abre a tela para você cortar a foto
        aspect: [4, 3],      // <-- Força uma proporção menor
        quality: 0.1,        // <-- Compressão extrema (modo batata) só para o teste passar
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        setArquivo({
          uri: asset.uri,
          name: asset.fileName || `foto_certificado_${Date.now()}.jpg`, 
          mimeType: asset.mimeType || 'image/jpeg',
        });
      }
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível abrir a câmera.');
    }
  };

  const handleEnviar = async () => {
    if (!titulo || !horas || !arquivo) {
      Alert.alert('Atenção', 'Preencha todos os campos e anexe um arquivo antes de enviar.');
      return;
    }
    
    setLoading(true); // <-- LIGA A BOLINHA ANTES DE MANDAR
    
    try {
      const token = await AsyncStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('titulo', titulo);
      formData.append('cargaHoraria', horas);
      
      formData.append('certificado', { 
        uri: arquivo.uri,
        name: arquivo.name, 
        type: arquivo.mimeType || 'application/octet-stream',
      });

      const response = await fetch(apiUrl('/api/alunos/atividades'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Erro', data.message || 'Erro ao enviar atividade.');
        return;
      }

      Alert.alert(
        'Sucesso', 
        'Atividade enviada para análise!',
        [
          {
            text: 'OK',
            onPress: () => {
              setTitulo('');
              setHoras('');
              setArquivo(null);
              navigation.navigate('Listagem'); 
            }
          }
        ]
      );
      
    } catch (error) {
      Alert.alert('Erro', 'Falha na conexão com o servidor. Verifique sua internet.');
    } finally {
      setLoading(false); // <-- DESLIGA A BOLINHA NO FINAL (DANDO ERRO OU SUCESSO)
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

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Nova Submissão</Text>
        <Text style={styles.subtitle}>Preencha os dados e anexe o seu certificado.</Text>

        <CustomInput 
          label="Título da Atividade" 
          placeholder="Ex: Palestra sobre Inteligência Artificial" 
          value={titulo}
          onChangeText={setTitulo}
        />

        <CustomInput 
          label="Carga Horária (h)" 
          placeholder="Ex: 10" 
          keyboardType="numeric"
          value={horas}
          onChangeText={setHoras}
        />

        <Text style={styles.label}>Anexo</Text>
        
        {arquivo ? (
          <TouchableOpacity 
            style={[styles.uploadBtn, { borderColor: '#4CAF50', backgroundColor: '#E8F5E9' }]} 
            onPress={() => setArquivo(null)}
            disabled={loading} // <-- Impede de remover a foto enquanto envia
          >
            <Text style={[styles.uploadBtnText, { color: '#2E7D32' }]}>
              ✅ {arquivo.name} (Clique para remover)
            </Text>
          </TouchableOpacity>
        ) : (
          <View>
            <TouchableOpacity style={styles.uploadBtn} onPress={handleSelecionarArquivo}>
              <Text style={styles.uploadBtnText}>📂 Escolher PDF ou Imagem</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.uploadBtn, { marginTop: 10 }]} onPress={handleTirarFoto}>
              <Text style={styles.uploadBtnText}>📸 Tirar Foto na Hora</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ marginTop: 20 }}>
          {/* Lógica Visual: Se estiver enviando mostra a bolinha, senão mostra o botão */}
          {loading ? (
            <ActivityIndicator size="large" color="#0066CC" style={{ padding: 15 }} />
          ) : (
            <CustomButton 
              title="Enviar para Validação" 
              onPress={handleEnviar} 
            />
          )}
        </View>

        <TouchableOpacity 
          style={{ marginTop: 30, marginBottom: 20, alignItems: 'center', padding: 15, backgroundColor: '#FFEBEB', borderRadius: 8 }} 
          onPress={handleLogout}
          disabled={loading} // <-- Impede de sair no meio do envio
        >
          <Text style={{ color: '#D9534F', fontWeight: 'bold', fontSize: 16 }}>Sair do Sistema</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}