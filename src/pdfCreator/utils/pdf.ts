import { PDFPreviewProps } from "../types";
import { pdf } from "@react-pdf/renderer";
import React from "react";
import PDFContent from "../components/PDFContent";

export const generatePDF = async ({
  pages,
  settings,
  declarationData,
}: PDFPreviewProps): Promise<void> => {
  try {
    // Create PDF document
    const element = React.createElement(PDFContent, {
      pages,
      settings,
      declarationData,
      selectedPageId: null,
    });

    // Generate PDF blob
    const blob = await pdf(element).toBlob();

    // Create and trigger download
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `document-${new Date().toISOString().split("T")[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Cleanup
    setTimeout(() => URL.revokeObjectURL(url), 100);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};
