import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Text, TouchableOpacity, View } from 'react-native';
import { apiUrl } from '../../services/api';
import styles from './styles';

// Importando os nossos componentes modulares
import CustomButton from '../../components/CustomButton';
import CustomInput from '../../components/CustomInput';

export default function Login({ navigation }) {
  // --- ESTADO DE CARREGAMENTO ---
  const [loading, setLoading] = useState(false); // Vai controlar a bolinha de loading

  // --- ESTADOS DO PRIMEIRO ACESSO ---
  const [isPrimeiroAcesso, setIsPrimeiroAcesso] = useState(false);
  const [matriculaAcesso, setMatriculaAcesso] = useState('');

  // --- ESTADOS NORMAIS DE LOGIN ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    // ---------------------------------------------------------
    // FLUXO 1: PRIMEIRO ACESSO (CRIAR SENHA)
    // ---------------------------------------------------------
    if (isPrimeiroAcesso) {
      if (!matriculaAcesso || !email || !password) {
        Alert.alert('Aviso', 'Preencha matrícula, e-mail e a nova senha.');
        return;
      }

      setLoading(true); // Liga a bolinha de carregamento
      try {
        const res = await fetch(apiUrl('/api/alunos/auth/primeiro-acesso'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            matricula: matriculaAcesso.trim(), 
            email: email.trim(), 
            novaSenha: password 
          })
        });

        if (res.ok) {
          Alert.alert('Sucesso!', 'Sua senha foi cadastrada. Faça o login para entrar.');
          setIsPrimeiroAcesso(false); 
          setPassword(''); 
        } else {
          const data = await res.json();
          Alert.alert('Erro', data.message || data.mensagem || 'Dados não conferem com o cadastro da coordenação.');
        }
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível conectar ao servidor. Verifique sua internet.');
      } finally {
        setLoading(false); // Desliga a bolinha independentemente de dar erro ou sucesso
      }
    } 
    // ---------------------------------------------------------
    // FLUXO 2: LOGIN NORMAL
    // ---------------------------------------------------------
    else {
      // VALIDAÇÃO NOVA: Impede de enviar campos vazios
      if (!email || !password) {
        Alert.alert('Aviso', 'Preencha seu E-mail/Matrícula e sua Senha.');
        return;
      }

      setLoading(true); // Liga a bolinha de carregamento
      try {
        const res = await fetch(apiUrl('/api/alunos/auth/login'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), matricula: email.trim(), senha: password })
        });

        const data = await res.json();

        if (!res.ok) {
          Alert.alert('Erro', data.message || data.mensagem || 'Usuário ou senha incorretos.');
          return; // Para a execução aqui se der erro
        }

        // Se chegou aqui, o login deu certo!
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.usuario));

        // NOME CORRIGIDO: Redirecionando para o nome exato que está no seu routes.js
        navigation.replace('AlunoArea'); 

      } catch (error) {
        Alert.alert('Erro', 'Não foi possível conectar ao servidor. Verifique sua internet ou tente novamente em alguns segundos.');
      } finally {
        setLoading(false); // Desliga a bolinha
      }
    }
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
          />
        )}

        <CustomInput 
          label={isPrimeiroAcesso ? "E-mail" : "Login"} 
          placeholder={isPrimeiroAcesso ? "E-mail cadastrado" : "E-mail ou Matrícula"} 
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none" // Ajuda a não colocar primeira letra maiúscula no email
        />

        <CustomInput 
          label={isPrimeiroAcesso ? "Nova Senha" : "Senha"} 
          placeholder="••••••••" 
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
        />

        {/* Lógica Visual: Se estiver carregando mostra a bolinha, senão mostra o botão */}
        {loading ? (
          <ActivityIndicator size="large" color="#0066CC" style={{ marginTop: 20 }} />
        ) : (
          <CustomButton 
            title={isPrimeiroAcesso ? "Salvar Nova Senha" : "Entrar"} 
            onPress={handleLogin} 
          />
        )}

        <TouchableOpacity 
          style={{ marginTop: 20, alignItems: 'center' }} 
          onPress={() => setIsPrimeiroAcesso(!isPrimeiroAcesso)}
          disabled={loading} // Impede de trocar de tela enquanto carrega
        >
          <Text style={{ color: '#0066CC', fontWeight: 'bold', fontSize: 14 }}>
            {isPrimeiroAcesso 
              ? "Já tem uma senha? Faça o Login" 
              : "Primeiro Acesso? Clique aqui"}
          </Text>
        </TouchableOpacity>

      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2026 KORE Sistema de Gestão</Text>
      </View>
    </KeyboardAvoidingView>
  );
}