import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import styles from './styles';

import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';

export default function Envio() {
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

  const handleEnviar = async () => {
    if (!titulo || !horas || !arquivo) {
      Alert.alert('Atenção', 'Preencha todos os campos e anexe um arquivo antes de enviar.');
      return;
    }
    
    try {
      const token = await AsyncStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('titulo', titulo);
      formData.append('cargaHoraria', horas);
      
      // =========================================================================
      // ATENÇÃO AQUI: Troque a palavra 'certificado' abaixo para a palavra exata 
      // que o seu backend espera receber (pode ser 'file', 'documento', 'arquivo', etc).
      // O arquivo do aluno (independente do nome que ele salvou) vai dentro dessa "caixa".
      // =========================================================================
      formData.append('certificado', { 
        uri: arquivo.uri,
        name: arquivo.name, // O nome original do arquivo do aluno é mantido aqui
        type: arquivo.mimeType || 'application/octet-stream',
      });

      const response = await fetch('https://sistema-gestao-atividades-complementares.onrender.com/api/atividades', {
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

      Alert.alert('Sucesso', 'Atividade enviada para análise!');
      
      setTitulo('');
      setHoras('');
      setArquivo(null);
      
    } catch (error) {
      Alert.alert('Erro', 'Falha na conexão com o servidor.');
    }
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
        
        <TouchableOpacity style={styles.uploadBtn} onPress={handleSelecionarArquivo}>
          <Text style={styles.uploadBtnText}>
            {arquivo ? arquivo.name : '+ Selecionar Certificado (PDF/JPG)'}
          </Text>
        </TouchableOpacity>

        <CustomButton 
          title="Enviar para Validação" 
          onPress={handleEnviar} 
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}