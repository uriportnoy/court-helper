import { FileURL, typeColors } from "@/theTimeline/common";
import { Button } from "@/components/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, ExternalLink, File as FileIcon, Share } from "lucide-react";
import { Dispatch, SetStateAction, useRef, useState } from "react";

interface PDFButtonProps {
  setViewingFile: Dispatch<SetStateAction<FileURL>>;
  file: FileURL;
}
export default function PDFButton({ setViewingFile, file }: PDFButtonProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const longPressTimerRef = useRef<number | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const longPressActivatedRef = useRef(false);

  const clearLongPress = () => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    longPressActivatedRef.current = false;
    touchStartPosRef.current = null;
  };

  const openInNewWindow = () => {
    window.open(file.url, "_blank", "noopener,noreferrer");
    setMenuOpen(false);
  };

  const directDownload = async () => {
    try {
      const fileExtension =
        file.url?.split(".").pop()?.split("?")[0]?.toLowerCase() || "pdf";
      const filename = `${file.label || "document"}.${fileExtension}`;
      const res = await fetch(file.url, { mode: "cors" });
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback
      const a = document.createElement("a");
      a.href = file.url;
      a.download = file.label || "document";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } finally {
      setMenuOpen(false);
    }
  };

  const shareViaWhatsApp = async () => {
    try {
      const res = await fetch(file.url, { mode: "cors" });
      const blob = await res.blob();
      const ext =
        file.url?.split(".").pop()?.split("?")[0]?.toLowerCase() || "pdf";
      const typeFromHeader = res.headers.get("content-type") || "";
      const mimeGuess =
        typeFromHeader ||
        (ext === "pdf"
          ? "application/pdf"
          : ext === "png"
          ? "image/png"
          : ext === "jpg" || ext === "jpeg"
          ? "image/jpeg"
          : ext === "webp"
          ? "image/webp"
          : "application/octet-stream");
      const filename = `${file.label || "document"}.${ext}`;
      const FileCtor = (window as any).File as
        | (new (fileBits: BlobPart[], fileName: string, options?: FilePropertyBag) => File)
        | undefined;
      const nav: any = navigator;
      if (FileCtor) {
        const fileToShare = new FileCtor([blob], filename, { type: mimeGuess });
        if (nav.canShare && nav.canShare({ files: [fileToShare] })) {
          await nav.share({
            files: [fileToShare],
            title: file.label || "מסמך",
            text: "",
          });
        } else {
          // Fallback to link share if file share is not supported
          window.open(`https://wa.me/?text=${encodeURIComponent(file.url)}`, "_blank");
        }
      } else {
        // Fallback to link share if file share is not supported
        window.open(`https://wa.me/?text=${encodeURIComponent(file.url)}`, "_blank");
      }
    } catch {
      // Fallback to link share on any error
      window.open(`https://wa.me/?text=${encodeURIComponent(file.url)}`, "_blank");
    } finally {
      setMenuOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onContextMenuCapture={(e) => {
              // Capture-phase suppression to reliably prevent the browser menu
              e.preventDefault();
              e.stopPropagation();
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuOpen(true);
            }}
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (e.pointerType === "mouse") {
                if ((e as any).button === 2) {
                  // Right click
                  // One-time global suppression for stubborn browsers
                  document.addEventListener(
                    "contextmenu",
                    (ev) => ev.preventDefault(),
                    { capture: true, once: true }
                  );
                  setMenuOpen(true);
                } else {
                  // Left / Middle click -> open viewer
                  setViewingFile(file);
                  setMenuOpen(false);
                }
              } else {
                // Touch / Pen: start long-press detection
                touchStartPosRef.current = { x: e.clientX, y: e.clientY };
                longPressTimerRef.current = window.setTimeout(() => {
                  longPressActivatedRef.current = true;
                  setMenuOpen(true);
                }, 500);
              }
            }}
            onPointerMove={(e) => {
              if (!touchStartPosRef.current) return;
              const dx = Math.abs(e.clientX - touchStartPosRef.current.x);
              const dy = Math.abs(e.clientY - touchStartPosRef.current.y);
              if (dx > 10 || dy > 10) {
                // Cancel long-press if finger moves too much
                clearLongPress();
              }
            }}
            onPointerUp={(e) => {
              if (e.pointerType === "mouse") return;
              // For touch/pen: if long-press not activated, treat as tap -> open viewer
              if (!longPressActivatedRef.current) {
                setViewingFile(file);
                setMenuOpen(false);
              }
              clearLongPress();
            }}
            onPointerCancel={clearLongPress}
            className={`${
              (typeColors as any)[file.type] || "bg-slate-50"
            } hover:shadow-md transition-all`}
            title={file.label}
          >
            <FileIcon className="w-4 h-4 ml-2" />
            {file.label}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          side="bottom"
          className="min-w-[190px]"
        >
          <DropdownMenuItem
            onClick={directDownload}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            הורדה ישירה
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={openInNewWindow}
            className="flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            פתיחה בחלון חדש
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={shareViaWhatsApp}
            className="flex items-center gap-2"
          >
            <Share className="w-4 h-4" />
            שיתף קובץ
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
