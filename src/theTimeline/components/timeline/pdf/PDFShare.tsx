import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, ExternalLink, Share2 } from "lucide-react";
import { Button } from "@/components/ui";
import { useState } from "react";
import { FileURL } from "@/theTimeline/common";
import useFileShare from "./useFileShare";

export default function PDFShare({ file }: { file: FileURL }) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const { directDownload, viaWhatsApp } = useFileShare({ file });
  const openInNewWindow = () => {
    window.open(file.url, "_blank", "noopener,noreferrer");
    setShowShareMenu(false);
  };
  return (
    <DropdownMenu
      open={showShareMenu}
      onOpenChange={(open) => setShowShareMenu(open)}
    >
      <DropdownMenuTrigger asChild>
        <Button variant="outline" title={file.label}>
          <Share2 />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="bottom" className="min-w-[190px]">
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
          onClick={viaWhatsApp}
          className="flex items-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          שיתף קובץ
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
