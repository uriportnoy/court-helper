import React, { useState } from "react";
import { ItemProps } from "../types";
import { Trash2, GripVertical, ArrowDown, ArrowUp } from "lucide-react";
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

    if (isDragOver) {
      return draggedPage.position < page.position
        ? page.position
        : page.position - 1;
    }

    if (draggedPage.position < page.position) {
      return page.position - 1;
    }

    return page.position;
  };

  const displayPosition = isDragging ? page.position : getPreviewPosition();

  const handleDescriptionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleDescriptionBlur = () => {
    setIsEditing(false);
    if (description !== page.description) {
      onUpdate(page.id, { description });
    }
  };

  const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleDescriptionBlur();
    }
  };

  const getDropIndicator = () => {
    if (!draggedPage || draggedPage.id === page.id) return null;

    const direction = draggedPage.position < page.position ? "down" : "up";
    const Icon = direction === "down" ? ArrowDown : ArrowUp;

    return (
      <div
        className={`absolute ${
          direction === "down" ? "-bottom-3" : "-top-3"
        } left-1/2 transform -translate-x-1/2 z-10`}
      >
        <div className="relative">
          <div className="absolute -left-16 w-32 h-0.5 bg-blue-500" />
          <Icon className="w-6 h-6 text-blue-500" />
          <div className="absolute -right-16 w-32 h-0.5 bg-blue-500" />
        </div>
      </div>
    );
  };

  return (
    <div
      draggable={!isEditing}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        onDragStart(e, page);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        onDragOver(e);
      }}
      onDragEnd={onDragEnd}
      onDrop={(e) => onDrop(e, page)}
      className={`relative border rounded-lg p-2 transition-all duration-200 ${
        isDragging ? "opacity-50 scale-95 rotate-1" : ""
      } ${
        isDragOver
          ? "border-blue-500 border-2 transform scale-105"
          : "border-gray-200"
      }`}
    >
      {isDragOver && getDropIndicator()}

      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 cursor-grab hover:bg-gray-100 p-1 rounded transition-colors">
          <GripVertical size={18} className="text-gray-400" />
        </div>
        {page.hint && isEditing && (
          <textarea
            value={page.hint}
            readOnly
            style={{
              position: "absolute",
              height: "100px",
              top: "-100px",
              width: "98%",
              boxShadow: "1px 1px 1px 1px #eee",
              resize: "none",
              pointerEvents: "none",
              padding: "4px",
            }}
          />
        )}
        <div className="font-medium text-sm">נספח {displayPosition}</div>

        <div className="flex-grow">
          {isEditing ? (
            <>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleDescriptionBlur}
                onKeyDown={handleDescriptionKeyDown}
                className="w-full px-2 py-1 text-sm border rounded focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            </>
          ) : (
            <div
              onClick={handleDescriptionClick}
              className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded cursor-text min-h-[28px]"
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
          className="flex-shrink-0 text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default ItemForm;
