import PDFViewer from "./PDFViewer";

const samplePDF =
  "https://ontheline.trincoll.edu/images/bookdown/sample-local-pdf.pdf";

function PDFComponent() {
  return (
    <PDFViewer
      url={samplePDF}
      title="Sample PDF Document"
      className="inline-flex px-8 py-3 text-lg"
    />
  );
}

export default PDFComponent;
