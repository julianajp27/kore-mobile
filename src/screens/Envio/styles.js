import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
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
  uploadBtn: {
    backgroundColor: '#e2e8f0',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#94a3b8',
  },
  uploadBtnText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 14,
  },
  categoryBox: {
    marginBottom: 18,
  },
  categorySelect: {
    minHeight: 52,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categorySelectTextBox: {
    flex: 1,
    paddingRight: 12,
  },
  categorySelectText: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '700',
  },
  categoryPlaceholder: {
    color: '#94a3b8',
    fontWeight: '600',
  },
  categorySelectMeta: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 3,
  },
  categoryChevron: {
    color: '#0f172a',
    fontSize: 22,
    fontWeight: '700',
  },
  categoryList: {
    marginTop: 8,
    gap: 8,
  },
  categoryOption: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
  },
  categoryOptionSelected: {
    borderColor: '#00b7b3',
    backgroundColor: '#e6fffb',
  },
  categoryTitle: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '700',
  },
  categoryMeta: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 4,
  },
  helperText: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 8,
  }
});
