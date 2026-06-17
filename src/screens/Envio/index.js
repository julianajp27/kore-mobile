import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
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
  const [cursos, setCursos] = useState([]);
  const [cursoAberto, setCursoAberto] = useState(false);
  const [categoriaId, setCategoriaId] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [categoriaAberta, setCategoriaAberta] = useState(false);

  const carregarCategorias = useCallback(async (cursoSelecionadoId = '') => {
    try {
      setCarregandoCategorias(true);

      const token = await AsyncStorage.getItem('token');
      const endpoint = cursoSelecionadoId
        ? `/api/alunos/categorias?cursoId=${encodeURIComponent(cursoSelecionadoId)}`
        : '/api/alunos/categorias';

      const response = await fetch(apiUrl(endpoint), {
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
      const cursosRecebidos = Array.isArray(data.cursos) ? data.cursos : [];

      // Agora que o back-end está corrigido, podemos definir os cursos diretamente
      setCursos(cursosRecebidos);
      setCategorias(lista);

      // Define um novo curso padrão apenas se nenhum estiver selecionado
      if (!cursoSelecionadoId) {
        const novoCursoId = data.cursoId || cursosRecebidos[0]?._id || cursosRecebidos[0]?.id || '';
        if (novoCursoId) {
          setCursoId(novoCursoId);
        }
      }

      setCategoriaId((categoriaAtualId) => (
        lista.some((categoria) => categoria._id === categoriaAtualId) ? categoriaAtualId : ''
      ));
    } catch (_error) {
      setCategorias([]);
    } finally {
      setCarregandoCategorias(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarCategorias(cursoId);
    }, [carregarCategorias, cursoId])
  );

  const cursoSelecionado = cursos.find((curso) => String(curso._id || curso.id) === String(cursoId));
  const categoriaSelecionada = categorias.find((categoria) => categoria._id === categoriaId);

  const handleSelecionarCurso = (novoCursoId) => {
    setCursoId(novoCursoId);
    setCategoriaId('');
    setCategoriaAberta(false);
    setCursoAberto(false);
    carregarCategorias(novoCursoId);
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
    } catch (_err) {
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
    } catch (_err) {
      Alert.alert('Erro', 'Não foi possível abrir a câmera.');
    }
  };

  const handleEnviar = async () => {
    if (!titulo.trim() || !cursoId || !categoriaId || !horas || !arquivo) {
      Alert.alert('Atenção', 'Preencha título, curso, categoria, carga horária e anexe um certificado.');
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
            setCursoAberto(false);
            setCategoriaId('');
            setCategoriaAberta(false);
            navigation.navigate('Certificados');
          }
        }
      ]);
    } catch (_error) {
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

        <Text style={styles.label}>Curso</Text>

        <TouchableOpacity style={styles.categorySelect} onPress={() => setCursoAberto(!cursoAberto)} disabled={loading || carregandoCategorias}>
          <View style={styles.categorySelectTextBox}>
            <Text style={[styles.categorySelectText, !cursoSelecionado && styles.categoryPlaceholder]}>
              {cursoSelecionado ? cursoSelecionado.nome : 'Selecionar curso'}
            </Text>

            {cursoSelecionado?.codigo ? (
              <Text style={styles.categorySelectMeta}>{cursoSelecionado.codigo}</Text>
            ) : null}
          </View>

          <Text style={styles.categoryChevron}>{cursoAberto ? '⌃' : '⌄'}</Text>
        </TouchableOpacity>

        {cursoAberto ? (
          <View style={styles.categoryList}>
            {cursos.length ? cursos.map((curso) => {
              const id = curso._id || curso.id;
              const selecionado = String(cursoId) === String(id);

              return (
                <TouchableOpacity
                  key={id}
                  style={[styles.categoryOption, selecionado && styles.categoryOptionSelected]}
                  onPress={() => handleSelecionarCurso(id)}
                >
                  <Text style={[styles.categoryOptionTitle, selecionado && styles.categoryOptionTitleSelected]}>
                    {curso.nome}
                  </Text>
                  {curso.codigo ? (
                    <Text style={[styles.categoryOptionMeta, selecionado && styles.categoryOptionMetaSelected]}>
                      {curso.codigo}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              );
            }) : (
              <Text style={styles.emptyCategoryText}>Nenhum curso disponível.</Text>
            )}
          </View>
        ) : null}

        <Text style={styles.label}>Categoria</Text>

        <TouchableOpacity style={styles.categorySelect} onPress={() => setCategoriaAberta(!categoriaAberta)} disabled={loading || carregandoCategorias || !cursoId}>
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