🎓 KORE Mobile
Aplicativo mobile desenvolvido em React Native com Expo para o Sistema de Gestão de Atividades Complementares (KORE).

O aplicativo permite que alunos realizem autenticação, enviem certificados de atividades complementares, acompanhem solicitações enviadas e visualizem o progresso das horas acadêmicas exigidas pelo curso.

📱 Visão Geral
O KORE Mobile foi criado para simplificar o processo de gestão de atividades complementares, oferecendo ao aluno uma experiência prática e centralizada.

Novidade: O aplicativo agora suporta alunos com múltiplas matrículas ativas, permitindo alternar entre diferentes cursos no Dashboard e realizar submissões específicas para cada curso de forma independente.

A aplicação se comunica diretamente com a API do Sistema de Gestão de Atividades Complementares, permitindo:

Login de alunos

Primeiro acesso com definição de senha

Visualização do dashboard acadêmico (suporte a múltiplos cursos)

Consulta de certificados enviados

Envio de novas atividades

Upload de documentos PDF

Captura de fotos do certificado pela câmera

Controle de horas aprovadas

Controle de horas em análise

Visualização de atividades reprovadas

🏗 Arquitetura
A aplicação segue uma arquitetura baseada em componentes e separação por responsabilidades.

Estrutura Geral
kore-mobile/
│

├── App.js

├── assets/

│ └── images/

├── src/

│ ├── components/

│ │ ├── CustomButton.js

│ │ └── CustomInput.js

│ ├── routes/

│ │ ├── index.js

│ │ └── aluno.routes.js

│ ├── screens/

│ │ ├── Login/

│ │ ├── Dashboard/

│ │ ├── Envio/

│ │ └── Listagem/

│ └── services/

│ └── api.js

├── package.json

└── app.json

🧩 Camadas da Aplicação
1. Apresentação (Screens)
Login
Permite login tradicional, primeiro acesso e definição de senha inicial.

Dashboard
Apresenta progresso, horas aprovadas, horas em análise, atividades totais e reprovadas. Inclui seletor de cursos para alunos com múltiplas matrículas.

Certificados
Lista todas as atividades enviadas. Exibe título, categoria, status, horas e justificativas de reprovação.

Envio
Tela para envio de certificados. Permite seleção do curso, categoria, upload de PDF, captura por câmera, carga horária e descrição da atividade.

2. Componentes Reutilizáveis
CustomButton: Botão padronizado.

CustomInput: Campo de entrada reutilizável.

3. Navegação
Utiliza React Navigation.

Stack Navigation: Fluxo principal (Login → Área do Aluno).

Bottom Tab Navigation: Dashboard, Certificados, Enviar.

4. Serviços
API
Arquivo: src/services/api.js

export const API_BASE_URL = 'https://sistema-gestao-atividades-complementares.onrender.com';

Fluxo de Autenticação
Login: POST /api/alunos/auth/login

Primeiro Acesso: POST /api/alunos/auth/primeiro-acesso
O token é armazenado localmente utilizando AsyncStorage.

Dashboard
Ao acessar o Dashboard são realizadas consultas para:

GET /api/alunos/meus-cursos

GET /api/alunos/atividades ou GET /api/alunos/atividades?cursoId=ID

Envio de Certificados
Endpoint: POST /api/alunos/atividades

Upload: multipart/form-data (PDF, JPG, JPEG, PNG)

Bibliotecas: expo-document-picker e expo-image-picker

Listagem de Certificados
Consulta: GET /api/alunos/atividades
Exibindo: Título, Categoria, Horas, Status e Justificativa de reprovação.

Persistência Local
Utiliza AsyncStorage para manter o token, dados do usuário e o curso selecionado no dashboard.

🚀 Tecnologias Utilizadas
Framework: React Native 0.81.5

Plataforma: Expo SDK 54

Navegação: React Navigation

Armazenamento: AsyncStorage

Upload: Expo Document Picker

Câmera: Expo Image Picker

Ícones: Expo Vector Icons

📦 Dependências Principais
{
"@react-navigation/native": "^7.2.5",
"@react-navigation/stack": "^7.9.3",
"@react-navigation/bottom-tabs": "^7.16.2",
"@react-native-async-storage/async-storage": "2.2.0",
"expo-document-picker": "~14.0.8",
"expo-image-picker": "~17.0.8",
"react-native": "0.81.5",
"expo": "~54.0.34"
}

⚙️ Requisitos
Node.js 18+

npm 10+

Expo Go

Android ou iOS

🔧 Instalação
Clone o projeto: git clone https://github.com/julianajp27/kore-mobile.git

Entre na pasta: cd kore-mobile

Instale as dependências: npm install

▶️ Executando o Projeto
Inicie o Expo:
npx expo start

🔄 Integração com Backend
O aplicativo consome a API: Sistema de Gestão de Atividades Complementares.
Segurança: Autenticação via token Bearer JWT enviada em todas as requisições autenticadas.

🚧 Melhorias Futuras
Notificações Push

Recuperação de senha

Perfil do aluno

Download de certificados enviados

Modo offline

Dashboard com gráficos

Filtros avançados

👨‍💻 Equipe
Aline Souza, Ingrid Rosendo, Juliana Jardim, Julliane Valentin, Lucas Querubim, Renata Gusmão.
Projeto desenvolvido para a disciplina de CODING: MOBILE.

📄 Licença
Projeto desenvolvido para fins acadêmicos e educacionais.
