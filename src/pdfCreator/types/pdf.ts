import { DeclarationData } from "pdfCreator/types";
import { Page } from "./page";

export interface PDFSettings {
  showTable: boolean;
  showPages: boolean;
  showDeclaration: boolean;
  withSignature: boolean;
}

export interface PDFPreviewProps {
  pages: Page[];
  selectedPageId: string | null;
  settings: PDFSettings;
  declarationData: DeclarationData;
}
