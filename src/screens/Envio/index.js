import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import CustomButton from '../../components/CustomButton';
import CustomInput from '../../components/CustomInput';
import { apiUrl } from '../../services/api';
import styles from './styles';

export default function Envio({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [carregandoCategorias, setCarregandoCategorias] = useState(false);

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataRealizacao, setDataRealizacao] = useState('');
  const [horas, setHoras] = useState('');
  const [arquivo, setArquivo] = useState(null);

  const [cursoId, setCursoId] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [categoriaAberta, setCategoriaAberta] = useState(false);

  useFocusEffect(
    useCallback(() => {
      carregarCategorias();
    }, [])
  );

  const carregarCategorias = async () => {
    try {
      setCarregandoCategorias(true);

      const token = await AsyncStorage.getItem('token');

      const response = await fetch(apiUrl('/api/alunos/categorias'), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        setCategorias([]);
        return;
      }

      const lista = Array.isArray(data) ? data : data.categorias || data.data || [];

      setCategorias(lista);
      setCursoId(data.cursoId || data.curso?._id || lista[0]?.curso?._id || lista[0]?.curso || '');
    } catch (error) {
      setCategorias([]);
    } finally {
      setCarregandoCategorias(false);
    }
  };

  const categoriaSelecionada = categorias.find((categoria) => categoria._id === categoriaId);

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
        quality: 0.6,
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
    if (!titulo.trim() || !categoriaId || !horas || !arquivo) {
      Alert.alert('Atenção', 'Preencha título, categoria, carga horária e anexe um certificado.');
      return;
    }

    try {
      setLoading(true);

      const token = await AsyncStorage.getItem('token');

      const formData = new FormData();
      formData.append('titulo', titulo.trim());
      formData.append('descricao', descricao.trim());
      formData.append('dataRealizacao', dataRealizacao.trim());
      formData.append('cursoId', cursoId);
      formData.append('categoriaId', categoriaId);
      formData.append('cargaHorariaInformada', horas);
      formData.append('cargaHoraria', horas);

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

      Alert.alert('Sucesso', 'Atividade enviada para análise!', [
        {
          text: 'OK',
          onPress: () => {
            setTitulo('');
            setDescricao('');
            setDataRealizacao('');
            setHoras('');
            setArquivo(null);
            setCategoriaId('');
            setCategoriaAberta(false);
            navigation.navigate('Certificados');
          }
        }
      ]);
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

        <TouchableOpacity style={styles.categorySelect} onPress={() => setCategoriaAberta(!categoriaAberta)} disabled={loading}>
          <View style={styles.categorySelectTextBox}>
            <Text style={[styles.categorySelectText, !categoriaSelecionada && styles.categoryPlaceholder]}>
              {categoriaSelecionada ? categoriaSelecionada.nome : 'Selecionar categoria'}
            </Text>

            {categoriaSelecionada ? (
              <Text style={styles.categorySelectMeta}>{categoriaSelecionada.areaParametro}</Text>
            ) : null}
          </View>

          <Text style={styles.categoryChevron}>{categoriaAberta ? '⌃' : '⌄'}</Text>
        </TouchableOpacity>

        {carregandoCategorias ? (
          <ActivityIndicator color="#00B7B8" style={{ marginBottom: 16 }} />
        ) : categoriaAberta ? (
          <View style={styles.categoryList}>
            {categorias.length ? categorias.map((categoria) => {
              const selecionada = categoriaId === categoria._id;

              return (
                <TouchableOpacity
                  key={categoria._id}
                  style={[styles.categoryOption, selecionada && styles.categoryOptionSelected]}
                  onPress={() => {
                    setCategoriaId(categoria._id);
                    setCategoriaAberta(false);
                  }}
                >
                  <Text style={[styles.categoryOptionTitle, selecionada && styles.categoryOptionTitleSelected]}>
                    {categoria.nome}
                  </Text>
                  <Text style={[styles.categoryOptionMeta, selecionada && styles.categoryOptionMetaSelected]}>
                    {categoria.areaParametro}
                  </Text>
                </TouchableOpacity>
              );
            }) : (
              <Text style={styles.emptyCategoryText}>Nenhuma categoria disponível.</Text>
            )}
          </View>
        ) : null}

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
            style={[styles.uploadBtn, styles.uploadSelected]}
            onPress={() => setArquivo(null)}
            disabled={loading}
          >
            <Text style={[styles.uploadBtnText, styles.uploadSelectedText]}>
              {arquivo.name} (toque para remover)
            </Text>
          </TouchableOpacity>
        ) : (
          <View>
            <TouchableOpacity style={styles.uploadBtn} onPress={handleSelecionarArquivo} disabled={loading}>
              <Text style={styles.uploadBtnText}>Escolher PDF ou imagem</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.uploadBtn} onPress={handleTirarFoto} disabled={loading}>
              <Text style={styles.uploadBtnText}>Tirar foto na hora</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ marginTop: 20 }}>
          {loading ? (
            <ActivityIndicator size="large" color="#00B7B8" style={{ padding: 15 }} />
          ) : (
            <CustomButton title="Enviar para Validação" onPress={handleEnviar} />
          )}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} disabled={loading}>
          <Text style={styles.logoutText}>Sair do Sistema</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
