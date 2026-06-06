import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
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

  useEffect(() => {
    carregarCategorias();
  }, []);

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

      setCursoId(data.cursoId || '');
      setCategorias(Array.isArray(data.categorias) ? data.categorias : []);
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

  const handleEnviar = async () => {
    if (!titulo || !categoriaId || !horas || !arquivo) {
      Alert.alert('Atenção', 'Preencha título, categoria, carga horária e anexe um certificado.');
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
        formData.append('dataRealizacao', dataRealizacao);
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
          label="Data de Realização"
          placeholder="Ex: 2026-06-06"
          value={dataRealizacao}
          onChangeText={setDataRealizacao}
        />

        <Text style={styles.label}>Categoria</Text>

        {carregandoCategorias ? (
          <ActivityIndicator size="small" color="#0066CC" style={{ marginBottom: 16 }} />
        ) : (
          <View style={styles.categoryList}>
            {categorias.length === 0 ? (
              <Text style={styles.helperText}>Nenhuma categoria disponível para o seu curso.</Text>
            ) : (
              categorias.map((categoria) => {
                const selecionada = categoriaId === categoria._id;

                return (
                  <TouchableOpacity
                    key={categoria._id}
                    style={[styles.categoryOption, selecionada && styles.categoryOptionSelected]}
                    onPress={() => setCategoriaId(categoria._id)}
                    disabled={loading}
                  >
                    <Text style={styles.categoryTitle}>{categoria.nome}</Text>
                    <Text style={styles.categoryMeta}>{categoria.areaParametro}</Text>
                  </TouchableOpacity>
                );
              })
            )}
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
