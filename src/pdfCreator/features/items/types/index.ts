export interface Page {
  id: string;
  position: number;
  description: string;
  pageNumber: number;
  hint?: string;
}

export interface ItemProps {
  page: Page;
  onUpdate: (id: string, updates: Partial<Page>) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDragStart: (e: React.DragEvent, page: Page) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent, targetPage: Page) => void;
  isDragging: boolean;
  isDragOver: boolean;
  draggedPage: Page | null;
}

export interface ItemListProps {
  pages: Page[];
  selectedPageId: string | null;
  onUpdatePage: (id: string, updates: Partial<Page>) => void;
  onDeletePage: (id: string) => void;
  onSelectPage: (id: string) => void;
  onDragStart: (e: React.DragEvent, page: Page) => void;
  onDragOver: (e: React.DragEvent, page: Page) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent, page: Page) => void;
  draggedPage: Page | null;
  dragOverPage: Page | null;
}

export interface ItemPreviewProps {
  page: Page;
}
