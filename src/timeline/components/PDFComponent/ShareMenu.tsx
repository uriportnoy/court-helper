import React, { useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";

import {
  Mail,
  MessageCircle,
  Copy,
  Check,
  FileUp,
  Loader2,
  Link as LinkIcon,
} from "lucide-react";

interface ShareMenuProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}
export default function ShareMenu({
  isOpen,
  onClose,
  url,
  title,
}: ShareMenuProps) {
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState("");

  // Check once if Web Share API for files is supported
  const canShareFiles = React.useMemo(
    () =>
      typeof navigator !== "undefined" &&
      navigator.canShare &&
      navigator.canShare({ files: [new File([], "")] }),
    [],
  );

  const handleCopyUrl = async () => {
    setCopied(true);
    await navigator.clipboard.writeText(url);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareFile = async () => {
    if (!canShareFiles) {
      setError(
        "File sharing is not supported on your browser. Try sharing the link instead.",
      );
      return;
    }

    setIsSharing(true);
    setError("");
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");
      const blob = await response.blob();
      const file = new File([blob], `${title}.pdf`, {
        type: "application/pdf",
      });

      await navigator.share({
        files: [file],
        title: title,
        text: `Here is the document: ${title}`,
      });
      onClose(); // Close dialog on successful share
    } catch (err) {
      console.error("Error sharing file:", err);
      // @ts-ignore
      if (err.name !== "AbortError") {
        setError("Could not share file. Please try sharing the link.");
      }
    } finally {
      setIsSharing(false);
    }
  };

  const shareOptions = [
    {
      icon: Mail,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      label: "Email Link",
      desc: "Send a link via email",
      action: () => {
        const subject = encodeURIComponent(`Check out this document: ${title}`);
        const body = encodeURIComponent(
          `I wanted to share this document with you: ${title}\n\nView it here: ${url}`,
        );
        window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
      },
    },
    {
      icon: MessageCircle,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      label: "WhatsApp Link",
      desc: "Send a link via WhatsApp",
      action: () => {
        const text = encodeURIComponent(
          `Check out this document: ${title}\n${url}`,
        );
        window.open(`https://wa.me/?text=${text}`, "_blank");
      },
    },
    {
      icon: copied ? Check : LinkIcon,
      iconBg: "bg-gray-100",
      iconColor: copied ? "text-green-600" : "text-gray-600",
      label: copied ? "Copied!" : "Copy Link",
      desc: "Copy URL to clipboard",
      action: handleCopyUrl,
    },
  ];

  return (
    <Dialog visible={isOpen} onHide={onClose}>
      <div className="sm:max-w-md">
        <div>
          <div className="text-lg font-semibold">Share Document</div>
        </div>

        <div className="space-y-4 py-4">
          {canShareFiles && (
            <Button
              className="w-full justify-center gap-3 h-14 bg-slate-900 hover:bg-slate-800"
              onClick={handleShareFile}
              disabled={isSharing}
            >
              {isSharing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <FileUp className="w-5 h-5" />
              )}
              <div className="text-left">
                <div className="font-semibold text-base">
                  {isSharing ? "Preparing File..." : "Share as File"}
                </div>
              </div>
            </Button>
          )}

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t"></div>
            <span className="flex-shrink mx-4 text-xs text-gray-400 uppercase">
              Or Share Link
            </span>
            <div className="flex-grow border-t"></div>
          </div>

          {shareOptions.map((opt, index) => (
            <button
              key={index}
              className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 text-left transition-colors"
              onClick={opt.action}
            >
              <div
                className={`w-10 h-10 rounded-lg ${opt.iconBg} flex items-center justify-center flex-shrink-0`}
              >
                <opt.icon className={`w-5 h-5 ${opt.iconColor}`} />
              </div>
              <div>
                <div className="font-medium">{opt.label}</div>
                <div className="text-sm text-gray-500">{opt.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {error && (
          <div className="pt-2 border-t">
            <p className="text-sm text-red-600 text-center w-full">{error}</p>
          </div>
        )}
      </div>
    </Dialog>
  );
}
