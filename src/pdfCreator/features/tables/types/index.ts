import { Page } from "pdfCreator/features/items/types";

export interface TableProps {
  pages: Page[];
}

export interface TablePreviewProps extends TableProps {
  className?: string;
}
