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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 20,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 18,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f1923',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  itemCard: {
<<<<<<< HEAD
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
=======
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f1923',
>>>>>>> e7b22ee16ea72d27fe77cf128aa8771af80427ed
  },
  itemCategory: {
    fontSize: 13,
    color: '#475569',
    marginTop: 5,
  },
  itemHours: {
<<<<<<< HEAD
    fontSize: 14,
    color: '#777777',
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
=======
    fontSize: 12,
    color: '#64748b',
    marginTop: 5,
  },
  badge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignSelf: 'flex-start',
>>>>>>> e7b22ee16ea72d27fe77cf128aa8771af80427ed
  },
  badgeApproved: {
    backgroundColor: '#E8F5E9', // Verde claro para aprovado
  },
  badgePending: {
    backgroundColor: '#FFF9C4', // Amarelo claro para pendente
  },
  badgeRejected: {
    backgroundColor: '#fee2e2',
  },
  badgeText: {
    fontSize: 12,
<<<<<<< HEAD
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
=======
    fontWeight: '700',
  },
  badgeTextApproved: {
    color: '#047857',
  },
  badgeTextPending: {
    color: '#b45309',
  },
  badgeTextRejected: {
    color: '#dc2626',
  },
  rejectionBox: {
    marginTop: 14,
    padding: 12,
    backgroundColor: '#fff1f2',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },
  rejectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#b91c1c',
    marginBottom: 4,
  },
  rejectionText: {
    fontSize: 13,
    color: '#7f1d1d',
    lineHeight: 18,
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748b',
    marginTop: 32,
  },
  logoutButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
  },
  logoutText: {
    color: '#dc2626',
    fontWeight: '700',
    fontSize: 15,
  },
});
>>>>>>> e7b22ee16ea72d27fe77cf128aa8771af80427ed
