import { useRef, useEffect } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import { toast } from "sonner";

interface HandwrittenNoteProps {
  text: string;
}

export const HandwrittenNote = ({ text }: HandwrittenNoteProps) => {
  const noteRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!noteRef.current) return;

    try {
      const canvas = await html2canvas(noteRef.current, {
        backgroundColor: "#faf8f5",
        scale: 2,
      });

      const link = document.createElement("a");
      link.download = "handwritten-notes.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Notes downloaded successfully!");
    } catch (error) {
      console.error("Error downloading notes:", error);
      toast.error("Failed to download notes");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-foreground">
          Your Handwritten Notes
        </h2>
        <Button onClick={handleDownload} variant="default" className="gap-2">
          <Download className="w-4 h-4" />
          Download
        </Button>
      </div>

      <div
        ref={noteRef}
        className="bg-paper border border-paperLine rounded-lg p-8 shadow-lg"
        style={{
          backgroundImage: `repeating-linear-gradient(
            transparent,
            transparent 31px,
            hsl(var(--paper-line)) 31px,
            hsl(var(--paper-line)) 32px
          )`,
          backgroundSize: "100% 32px",
          minHeight: "500px",
        }}
      >
        <div
          className="text-ink leading-loose"
          style={{
            fontFamily: "'Caveat', cursive",
            fontSize: "24px",
            lineHeight: "32px",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
};
