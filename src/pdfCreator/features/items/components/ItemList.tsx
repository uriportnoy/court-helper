import React, { useEffect, useState } from "react";
import { ItemListProps } from "../types";
import { ItemForm } from "./ItemForm";
import { getSortedPages } from "../utils/sorting";

export const ItemList: React.FC<ItemListProps> = ({
  pages,
  selectedPageId,
  onUpdatePage,
  onDeletePage,
  onSelectPage,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  draggedPage,
  dragOverPage,
}) => {
  const [renderKey, setRenderKey] = useState(0);

  useEffect(() => {
    setRenderKey((prev) => prev + 1);
  }, [pages]);

  const sortedPages = getSortedPages(pages);

  const handleDrop = (e: React.DragEvent, page: Page) => {
    onDrop(e, page);
    setRenderKey((prev) => prev + 1);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">עמודים</h2>
      <div className="space-y-2">
        {sortedPages.map((page) => (
          <ItemForm
            key={`${page.id}-${renderKey}`}
            page={page}
            onUpdate={onUpdatePage}
            onDelete={onDeletePage}
            isSelected={selectedPageId === page.id}
            onSelect={onSelectPage}
            onDragStart={onDragStart}
            onDragOver={(e) => onDragOver(e, page)}
            onDragEnd={onDragEnd}
            onDrop={(e) => handleDrop(e, page)}
            isDragging={draggedPage?.id === page.id}
            isDragOver={dragOverPage?.id === page.id}
            draggedPage={draggedPage}
          />
        ))}
      </div>
    </div>
  );
};
