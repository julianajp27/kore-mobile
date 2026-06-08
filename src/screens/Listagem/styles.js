import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
  },
  itemCategory: {
    fontSize: 13,
    color: '#475569',
    marginTop: 5,
  },
  itemHours: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 5,
  },
  badge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  badgeApproved: {
    backgroundColor: '#d1fae5',
  },
  badgePending: {
    backgroundColor: '#fef3c7',
  },
  badgeRejected: {
    backgroundColor: '#fee2e2',
  },
  badgeText: {
    fontSize: 12,
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
