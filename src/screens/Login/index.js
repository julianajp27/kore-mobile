import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Text, TouchableOpacity, View } from 'react-native';
import CustomButton from '../../components/CustomButton';
import CustomInput from '../../components/CustomInput';
import { apiUrl } from '../../services/api';
import styles from './styles';

export default function Login({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [isPrimeiroAcesso, setIsPrimeiroAcesso] = useState(false);

  const [matriculaAcesso, setMatriculaAcesso] = useState('');
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');

  const limparCampos = () => {
    setMatriculaAcesso('');
    setLogin('');
    setSenha('');
  };

  const handlePrimeiroAcesso = async () => {
    if (!matriculaAcesso.trim() || !login.trim() || !senha) {
      Alert.alert('Aviso', 'Preencha matrícula, e-mail e a nova senha.');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(apiUrl('/api/alunos/auth/primeiro-acesso'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matricula: matriculaAcesso.trim(),
          email: login.trim(),
          novaSenha: senha
        })
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Erro', data.message || data.mensagem || 'Dados não conferem com o cadastro.');
        return;
      }

      Alert.alert('Sucesso', 'Senha cadastrada. Agora faça login.');
      setIsPrimeiroAcesso(false);
      limparCampos();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginNormal = async () => {
    if (!login.trim() || !senha) {
      Alert.alert('Aviso', 'Preencha login/matrícula e senha.');
      return;
    }

    try {
      setLoading(true);

      const loginLimpo = login.trim();

      const response = await fetch(apiUrl('/api/alunos/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginLimpo,
          matricula: loginLimpo,
          senha
        })
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Erro', data.message || data.mensagem || 'Usuário ou senha incorretos.');
        return;
      }

      const token = data.token;
      const usuario = data.usuario || data.aluno || data.user || data;

      if (!token) {
        Alert.alert('Erro', 'Token não retornado pela API.');
        return;
      }

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(usuario));

      navigation.replace('AlunoArea');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (isPrimeiroAcesso) {
      handlePrimeiroAcesso();
      return;
    }

    handleLoginNormal();
  };

  const alternarPrimeiroAcesso = () => {
    setIsPrimeiroAcesso(!isPrimeiroAcesso);
    limparCampos();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.loginCard}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>KORE</Text>
          <Text style={styles.subtitle}>Sistema de Gestão de Atividades Complementares</Text>
        </View>

        {isPrimeiroAcesso && (
          <CustomInput
            label="Matrícula"
            placeholder="Sua matrícula"
            value={matriculaAcesso}
            onChangeText={setMatriculaAcesso}
            keyboardType="numeric"
          />
        )}

        <CustomInput
          label={isPrimeiroAcesso ? 'E-mail' : 'Login'}
          placeholder={isPrimeiroAcesso ? 'E-mail cadastrado' : 'E-mail ou matrícula'}
          keyboardType="email-address"
          value={login}
          onChangeText={setLogin}
          autoCapitalize="none"
        />

        <CustomInput
          label={isPrimeiroAcesso ? 'Nova Senha' : 'Senha'}
          placeholder="••••••••"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        {loading ? (
          <ActivityIndicator size="large" color="#00B7B8" style={styles.loading} />
        ) : (
          <CustomButton
            title={isPrimeiroAcesso ? 'Salvar Nova Senha' : 'Entrar'}
            onPress={handleSubmit}
          />
        )}

        <TouchableOpacity
          style={styles.firstAccessButton}
          onPress={alternarPrimeiroAcesso}
          disabled={loading}
        >
          <Text style={styles.firstAccessText}>
            {isPrimeiroAcesso ? 'Já tem uma senha? Faça o login' : 'Primeiro Acesso? Clique aqui'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2026 KORE Sistema de Gestão</Text>
      </View>
    </KeyboardAvoidingView>
  );
}
