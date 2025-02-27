import { StyleSheet } from '@react-pdf/renderer';

export const affidavitStyles = StyleSheet.create({
  title: {
    fontSize: 32,
    marginBottom: 5,
    textAlign: 'center',
    fontFamily: 'David',
    fontWeight: 'bold'
  },
  titleUnderline: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    width: '30%',
    alignSelf: 'center',
  },
  subtitle: {
    fontSize: 24,
    marginBottom: 5,
    textAlign: 'center',
    fontFamily: 'David',
    fontWeight: 'bold'
  },
  subtitleUnderline: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    width: '20%',
    alignSelf: 'center',
    marginBottom: 20,
  },
  content: {
    fontSize: 16,
    textAlign: 'right',
    direction: 'rtl',
    marginBottom: 20,
    fontFamily: 'David',
    lineHeight: 1.5,
    fontWeight: 'normal'
  },
});