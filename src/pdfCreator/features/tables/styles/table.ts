import { StyleSheet } from '@react-pdf/renderer';

export const tableStyles = StyleSheet.create({
  page: {
    padding: '40 20',
    fontFamily: 'David',
    direction: 'rtl',
  },
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'David',
    fontWeight: 'bold',
  },
  titleUnderline: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    width: '20%',
    alignSelf: 'center',
  },
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#000',
    borderStyle: 'solid',
  },
  row: {
    flexDirection: 'row-reverse',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    minHeight: 35,
  },
  headerRow: {
    backgroundColor: '#F3F4F6',
    minHeight: 40,
  },
  cell: {
    flex: 1,
    padding: 8,
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#000',
  },
  headerCell: {
    fontFamily: 'David',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },
  contentCell: {
    fontFamily: 'David',
    fontSize: 12,
    color: '#374151',
    textAlign: 'center',
  },
  indexCell: {
    flex: 0.5,
  },
  descriptionCell: {
    flex: 2,
  },
  pageCell: {
    flex: 0.5,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
});
