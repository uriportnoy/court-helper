export interface Page {
  id: string;
  position: number;
  description: string;
  pageNumber: number;
}

export interface PageFormProps {
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