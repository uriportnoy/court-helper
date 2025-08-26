import React, { useState } from "react";
import { ItemProps } from "../types";
import { Trash2, GripVertical } from "lucide-react";
import { PageNumberControl } from "./PageNumberControl";

export const ItemForm: React.FC<ItemProps> = ({
  page,
  onUpdate,
  onDelete,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  isDragging,
  isDragOver,
  draggedPage,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(page.description);

  const getPreviewPosition = () => {
    if (!draggedPage || draggedPage.id === page.id) {
      return page.position;
    }
    return isDragOver
      ? draggedPage.position < page.position
        ? page.position
        : page.position - 1
      : draggedPage.position < page.position
        ? page.position - 1
        : page.position;
  };

  const displayPosition = isDragging ? page.position : getPreviewPosition();

  return (
    <div
      draggable={!isEditing}
      onDragStart={(e) => onDragStart(e, page)}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(e);
      }}
      onDragEnd={onDragEnd}
      onDrop={(e) => onDrop(e, page)}
      className={`relative border rounded-lg p-4 transition-all duration-200 
        ${isDragging ? "opacity-50 scale-95 rotate-1" : ""} 
        ${isDragOver ? "border-blue-500 border-2 scale-105" : "border-gray-200"}`}
    >
      <div className="flex items-center gap-4">
        <div className="cursor-grab hover:bg-gray-100 p-2 rounded transition-colors">
          <GripVertical className="text-gray-400 w-4 h-4" />
        </div>

        <div className="font-medium text-sm">נספח {displayPosition}</div>

        <div className="flex-grow">
          {isEditing ? (
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => {
                setIsEditing(false);
                if (description !== page.description) {
                  onUpdate(page.id, { description });
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  setIsEditing(false);
                  if (description !== page.description) {
                    onUpdate(page.id, { description });
                  }
                }
              }}
              className="w-full px-3 py-2 text-sm border rounded focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div
              onClick={() => setIsEditing(true)}
              className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded cursor-text min-h-[38px]"
            >
              {page.description || "הוסף תיאור..."}
            </div>
          )}
        </div>

        <PageNumberControl
          value={page.pageNumber}
          onChange={(value) => onUpdate(page.id, { pageNumber: value })}
        />

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(page.id);
          }}
          className="text-gray-400 hover:text-red-500 p-2 rounded hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ItemForm;
