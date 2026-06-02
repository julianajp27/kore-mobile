import React, { useState } from 'react';
import { View, Text, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './styles';

// Importando os nossos componentes modulares
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const res = await fetch('https://sistema-gestao-atividades-complementares.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), senha: password })
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert('Erro', data.message || data.mensagem || 'Erro ao fazer login');
        return;
      }

      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.usuario));

      navigation.replace('AlunoArea'); 

    } catch (error) {
      Alert.alert('Erro', 'Erro de conexão com o servidor.');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.loginCard}>
        
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>KORE</Text>
          <Text style={styles.subtitle}>Sistema de Gestão de Atividades Complementares</Text>
        </View>

        {/* Usando nossos Componentes Customizados */}
        <CustomInput 
          label="Email" 
          placeholder="seu@email.com" 
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <CustomInput 
          label="Senha" 
          placeholder="••••••••" 
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
        />

        <CustomButton 
          title="Entrar" 
          onPress={handleLogin} 
        />

      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2026 KORE Sistema de Gestão</Text>
      </View>
    </KeyboardAvoidingView>
  );
}