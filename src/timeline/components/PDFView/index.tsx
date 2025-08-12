import { Fragment } from "react";
import styled from "styled-components";
import PDFButton from "./PDFButton.tsx";
import { CurrentFile } from "../UploadPDF/types.ts";
import { ItemMenuProps } from "../ItemMenu.tsx";

interface PdfType {
  fileURL: Array<CurrentFile>;
  date: string;
  item: ItemMenuProps;
}

const MultiplePdfViewer = ({ fileURL, date, item }: PdfType) => {
  if (!fileURL?.length) {
    return null;
  }
  return (
    <Wrapper>
      {fileURL.map((pdf, index) => {
        return <Fragment key={`${pdf.url || ""}-${index}`}>
          <PDFButton
            url={pdf.url}
            type={pdf.type}
            date={date}
            label={pdf.label || "View PDF"}
            item={item}
          />
        </Fragment>
      })}
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
