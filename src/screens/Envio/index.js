import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { apiUrl } from '../../services/api';
import styles from './styles';

import CustomButton from '../../components/CustomButton';
import CustomInput from '../../components/CustomInput';

export default function Envio({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [carregandoCategorias, setCarregandoCategorias] = useState(false);

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataRealizacao, setDataRealizacao] = useState('');
  const [horas, setHoras] = useState('');
  const [arquivo, setArquivo] = useState(null);

  const [cursoId, setCursoId] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [categoriaId, setCategoriaId] = useState('');
  const [categoriaAberta, setCategoriaAberta] = useState(false);

  useFocusEffect(
    useCallback(() => {
      carregarCategorias();
    }, [])
  );

  const carregarCategorias = async () => {
    setCarregandoCategorias(true);

    try {
      const token = await AsyncStorage.getItem('token');

      const response = await fetch(apiUrl('/api/alunos/categorias'), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Erro', data.message || 'Não foi possível carregar as categorias.');
        return;
      }

      const listaSegura = Array.isArray(data) ? data : (Array.isArray(data.categorias) ? data.categorias : []);
      
      setCursoId(data.cursoId || '');
      setCategorias(listaSegura);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível conectar ao servidor para carregar categorias.');
    } finally {
      setCarregandoCategorias(false);
    }
  };

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
        Alert.alert('Permissão negada', 'Precisamos de acesso à câmera para tirar a foto do certificado.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
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

  const handleDataChange = (text) => {
    let numericText = text.replace(/\D/g, '');
    
    if (numericText.length > 8) {
      numericText = numericText.substring(0, 8);
    }
    
    let formattedText = numericText;
    
    if (numericText.length > 2 && numericText.length <= 4) {
      formattedText = `${numericText.substring(0, 2)}/${numericText.substring(2)}`;
    } else if (numericText.length > 4) {
      formattedText = `${numericText.substring(0, 2)}/${numericText.substring(2, 4)}/${numericText.substring(4)}`;
    }
    
    setDataRealizacao(formattedText);
  };

  // --- A linha vital corrigida ---
  const categoriaSelecionada = categorias.find((categoria) => categoria._id === categoriaId);

  const handleEnviar = async () => {
    if (!titulo || !categoriaId || !horas || !arquivo) {
      Alert.alert('Atenção', 'Preencha título, categoria, carga horária e anexe um certificado.');
      return;
    }

    if (dataRealizacao && dataRealizacao.length !== 10) {
      Alert.alert('Atenção', 'A data de realização deve estar no formato DD/MM/AAAA.');
      return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('token');

      const formData = new FormData();
      formData.append('titulo', titulo);
      formData.append('descricao', descricao || titulo);
      formData.append('cursoId', cursoId);
      formData.append('categoriaId', categoriaId);
      formData.append('cargaHoraria', horas);
      formData.append('cargaHorariaInformada', horas);

      if (dataRealizacao) {
        const [dia, mes, ano] = dataRealizacao.split('/');
        const dataISO = `${ano}-${mes}-${dia}`;
        formData.append('dataRealizacao', dataISO);
      }

      formData.append('certificado', {
        uri: arquivo.uri,
        name: arquivo.name || `certificado_${Date.now()}.jpg`,
        type: arquivo.mimeType || arquivo.type || 'application/octet-stream',
      });

      const response = await fetch(apiUrl('/api/alunos/atividades'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
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
              setDescricao('');
              setDataRealizacao('');
              setHoras('');
              setCategoriaId('');
              setArquivo(null);
              navigation.navigate('Listagem');
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Erro', 'Falha na conexão com o servidor. Verifique sua internet.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair do KORE',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sim',
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
        <Text style={styles.subtitle}>Preencha os dados e anexe o certificado.</Text>

        <CustomInput
          label="Título da Atividade"
          placeholder="Ex: Palestra sobre Inteligência Artificial"
          value={titulo}
          onChangeText={setTitulo}
        />

        <CustomInput
          label="Descrição"
          placeholder="Descreva brevemente a atividade"
          value={descricao}
          onChangeText={setDescricao}
        />

        <CustomInput
          label="Data de Realização (Opcional)"
          placeholder="Ex: 08/06/2026"
          value={dataRealizacao}
          onChangeText={handleDataChange}
          keyboardType="numeric"
          maxLength={10}
        />

        <Text style={styles.label}>Categoria</Text>

        {carregandoCategorias ? (
          <ActivityIndicator size="small" color="#0066CC" style={{ marginBottom: 16 }} />
        ) : (
          <View style={styles.categoryBox}>
            <TouchableOpacity
              style={styles.categorySelect}
              onPress={() => setCategoriaAberta(!categoriaAberta)}
              disabled={loading || categorias.length === 0}
            >
              <View style={styles.categorySelectTextBox}>
                <Text style={[styles.categorySelectText, !categoriaSelecionada && styles.categoryPlaceholder]}>
                  {categoriaSelecionada ? categoriaSelecionada.nome : 'Selecionar categoria'}
                </Text>
                {categoriaSelecionada && (
                  <Text style={styles.categorySelectMeta}>{categoriaSelecionada.areaParametro}</Text>
                )}
              </View>
              <Text style={styles.categoryChevron}>{categoriaAberta ? '⌃' : '⌄'}</Text>
            </TouchableOpacity>

            {categorias.length === 0 ? (
              <Text style={styles.helperText}>Nenhuma categoria disponível para o seu curso.</Text>
            ) : categoriaAberta ? (
              <View style={styles.categoryList}>
                {categorias.map((categoria) => {
                  const selecionada = categoriaId === categoria._id;

                  return (
                    <TouchableOpacity
                      key={categoria._id}
                      style={[styles.categoryOption, selecionada && styles.categoryOptionSelected]}
                      onPress={() => {
                        setCategoriaId(categoria._id);
                        setCategoriaAberta(false);
                      }}
                      disabled={loading}
                    >
                      <Text style={styles.categoryTitle}>{categoria.nome}</Text>
                      <Text style={styles.categoryMeta}>{categoria.areaParametro}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}
          </View>
        )}
        
        <CustomInput
          label="Carga Horária (h)"
          placeholder="Ex: 10"
          keyboardType="numeric"
          value={horas}
          onChangeText={setHoras}
        />

        <Text style={styles.label}>Certificado</Text>

        {arquivo ? (
          <TouchableOpacity
            style={[styles.uploadBtn, { borderColor: '#4CAF50', backgroundColor: '#E8F5E9' }]}
            onPress={() => setArquivo(null)}
            disabled={loading}
          >
            <Text style={[styles.uploadBtnText, { color: '#2E7D32' }]}>
              {arquivo.name} - tocar para remover
            </Text>
          </TouchableOpacity>
        ) : (
          <View>
            <TouchableOpacity style={styles.uploadBtn} onPress={handleSelecionarArquivo} disabled={loading}>
              <Text style={styles.uploadBtnText}>Escolher PDF ou imagem</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.uploadBtn, { marginTop: 10 }]} onPress={handleTirarFoto} disabled={loading}>
              <Text style={styles.uploadBtnText}>Tirar foto na hora</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ marginTop: 20 }}>
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
          disabled={loading}
        >
          <Text style={{ color: '#D9534F', fontWeight: 'bold', fontSize: 16 }}>Sair do Sistema</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}