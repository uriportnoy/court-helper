import { Page } from '../../items/types';

export interface TableProps {
  pages: Page[];
}

export interface TablePreviewProps extends TableProps {
  className?: string;
}