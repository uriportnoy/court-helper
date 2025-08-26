import React from "react";
import { Document } from "@react-pdf/renderer";
import { PDFPreviewProps } from "../types";
import { TablePreview } from "../features/tables";
import { AffidavitPreview } from "../features/affidavits";
import { ItemPreview } from "../features/items";
import { getSortedPages } from "../features/items/utils/sorting";

// Import fonts before creating any PDF components
import "../config/fonts";

const PDFContent: React.FC<PDFPreviewProps> = ({
  pages,
  settings,
  declarationData,
}) => {
  const sortedPages = getSortedPages(pages);

  return (
    <Document
      title="מסמך תצהיר"
      author="Document Generator"
      creator="Document Generator"
      producer="Document Generator"
      language="he"
    >
      {settings.showTable && <TablePreview pages={sortedPages} />}

      {settings.showDeclaration && (
        <AffidavitPreview data={declarationData} settings={settings} />
      )}

      {settings.showPages &&
        sortedPages.map((page) => <ItemPreview key={page.id} page={page} />)}
    </Document>
  );
};

export default PDFContent;
