import { useCallback, useState } from "react";
import { Upload, FileText } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PDFUploaderProps {
  onFileSelect: (file: File) => void;
}

export const PDFUploader = ({ onFileSelect }: PDFUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      const pdfFile = files.find((file) => file.type === "application/pdf");

      if (pdfFile) {
        onFileSelect(pdfFile);
      } else {
        toast.error("Please upload a PDF file");
      }
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type === "application/pdf") {
        onFileSelect(file);
      } else {
        toast.error("Please upload a PDF file");
      }
    },
    [onFileSelect]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        "relative border-2 border-dashed rounded-lg p-12 transition-all duration-300",
        "hover:border-accent hover:bg-muted/30",
        isDragging ? "border-accent bg-muted/50 scale-[1.02]" : "border-border"
      )}
    >
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        id="pdf-upload"
      />
      <label
        htmlFor="pdf-upload"
        className="flex flex-col items-center justify-center cursor-pointer"
      >
        <div className="p-4 bg-primary/5 rounded-full mb-4">
          {isDragging ? (
            <FileText className="w-12 h-12 text-accent" />
          ) : (
            <Upload className="w-12 h-12 text-primary" />
          )}
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          {isDragging ? "Drop your PDF here" : "Upload PDF Document"}
        </h3>
        <p className="text-muted-foreground text-center">
          Drag and drop your PDF file here, or click to browse
        </p>
        <p className="text-sm text-ink-light mt-2">Supported format: PDF</p>
      </label>
    </div>
  );
};
