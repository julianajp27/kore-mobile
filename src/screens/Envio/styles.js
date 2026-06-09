import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f1923',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 25,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  categorySelect: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categorySelectTextBox: {
    flex: 1,
    paddingRight: 10,
  },
  categorySelectText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f1923',
  },
  categoryPlaceholder: {
    color: '#94a3b8',
    fontWeight: '500',
  },
  categorySelectMeta: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 3,
  },
  categoryChevron: {
    fontSize: 18,
    color: '#64748b',
    fontWeight: '700',
  },
  categoryList: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    marginBottom: 18,
    overflow: 'hidden',
  },
  categoryOption: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  categoryOptionSelected: {
    backgroundColor: '#e6fffb',
  },
  categoryOptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f1923',
  },
  categoryOptionTitleSelected: {
    color: '#008b8c',
  },
  categoryOptionMeta: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  categoryOptionMetaSelected: {
    color: '#008b8c',
  },
  emptyCategoryText: {
    color: '#64748b',
    fontSize: 13,
    marginBottom: 18,
  },
  uploadBtn: {
    backgroundColor: '#e2e8f0',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#94a3b8',
  },
  uploadBtnText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  uploadSelected: {
    borderColor: '#22c55e',
    backgroundColor: '#dcfce7',
  },
  uploadSelectedText: {
    color: '#166534',
  },
  logoutButton: {
    marginTop: 30,
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

