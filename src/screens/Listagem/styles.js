import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA', // O fundo clarinho que já estava na sua imagem
  },
  emptyText: {
    textAlign: 'center', 
    color: '#6c757d',
    marginTop: 20,
    fontSize: 16,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAEAEA', // Bordinha bem fina e elegante
  },
  itemInfo: {
    flex: 1,
    paddingRight: 10,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  itemHours: {
    fontSize: 14,
    color: '#777777',
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeApproved: {
    backgroundColor: '#E8F5E9', // Verde claro para aprovado
  },
  badgePending: {
    backgroundColor: '#FFF9C4', // Amarelo claro para pendente
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  badgeTextApproved: {
    color: '#2E7D32', // Texto verde escuro
  },
  badgeTextPending: {
    color: '#F57F17', // Texto laranja escuro
  },
  logoutButton: {
    marginHorizontal: 20, 
    marginBottom: 20, 
    alignItems: 'center', 
    padding: 15, 
    backgroundColor: '#FFEBEB', 
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#D9534F', 
    fontWeight: 'bold', 
    fontSize: 16,
  }
});