import { StyleSheet } from "@react-pdf/renderer";

export const commonStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "David",
    direction: "rtl",
  },
  titleContainer: {
    marginBottom: 10,
    alignItems: "center",
  },
  signatureContainer: {
    position: "relative",
    marginTop: 20,
    alignItems: "center",
    alignSelf: "flex-start",
    paddingTop: 60,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    width: 150,
    marginBottom: 5,
  },
  signatureText: {
    fontSize: 12,
    textAlign: "center",
    fontFamily: "David",
  },
  boldText: {
    fontFamily: "David-Bold",
  },
  signature: {
    position: "absolute",
    top: 0,
  },
});
