import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 22,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#00B7B8',
    marginTop: 6,
  },
  summaryMeta: {
    fontSize: 13,
    color: '#64748b',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 16,
  },
  progressFill: {
    height: 8,
    backgroundColor: '#00B7B8',
    borderRadius: 999,
  },
  progressText: {
    marginTop: 8,
    color: '#475569',
    fontWeight: '600',
    fontSize: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statCardFull: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 28,
    color: '#0f1923',
    fontWeight: '800',
    marginTop: 6,
  },
  statValueWarning: {
    fontSize: 28,
    color: '#f59e0b',
    fontWeight: '800',
    marginTop: 6,
  },
  statValueDanger: {
    fontSize: 28,
    color: '#ef4444',
    fontWeight: '800',
    marginTop: 6,
  },
  primaryLink: {
    backgroundColor: '#00B7B8',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 22,
  },
  primaryLinkText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  logoutButton: {
    marginTop: 14,
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
