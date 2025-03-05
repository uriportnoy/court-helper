import React from "react";
import styled from "styled-components";
import PDFButton from "./PDFButton.tsx";
import { CurrentFile } from "../UploadPDF/types.ts";

interface PdfType {
  fileURL: Array<CurrentFile>;
  date: string;
}

const MultiplePdfViewer = ({ fileURL, date }: PdfType) => {
  if (!fileURL?.length) {
    return null;
  }

  return (
    <Wrapper>
      {fileURL.map((pdf, index) => (
        <PDFButton
          key={`${pdf.url || ""}-${index}`}
          url={pdf.url}
          type={pdf.type}
          date={date}
          label={pdf.label || "View PDF"}
        />
      ))}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  direction: rtl;
`;

export default MultiplePdfViewer;
