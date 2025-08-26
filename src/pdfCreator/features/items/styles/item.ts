import { StyleSheet } from "@react-pdf/renderer";

export const itemStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "David",
    direction: "rtl",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    textAlign: "center",
    fontFamily: "David",
    fontWeight: "bold",
  },
  content: {
    fontSize: 18,
    textAlign: "center",
    fontFamily: "David",
  },
});
