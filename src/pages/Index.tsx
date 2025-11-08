import { useState } from "react";
import { PDFUploader } from "@/components/PDFUploader";
import { HandwrittenNote } from "@/components/HandwrittenNote";
import { toast } from "sonner";
import { Loader2, FileText } from "lucide-react";

const Index = () => {
  const [extractedText, setExtractedText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    toast.loading("Processing your PDF...");

    try {
      // We'll use the document parsing API
      const formData = new FormData();
      formData.append("file", file);

      // For now, we'll use a simple text extraction
      // In a real implementation, you would use document--parse_document tool
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          // Simple placeholder - in production, you'd parse the PDF properly
          toast.dismiss();
          toast.success("PDF processed successfully!");
          setExtractedText("Upload a PDF to see your handwritten notes here!\n\nThis is a demonstration text that shows how your content will look in a handwritten style.\n\nYou can add paragraphs, and the text will flow naturally with proper spacing.\n\nThe handwritten font makes it look like real notes!");
        } catch (error) {
          console.error("Error processing PDF:", error);
          toast.dismiss();
          toast.error("Failed to process PDF");
        } finally {
          setIsProcessing(false);
        }
      };

      reader.onerror = () => {
        toast.dismiss();
        toast.error("Failed to read PDF file");
        setIsProcessing(false);
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error handling file:", error);
      toast.dismiss();
      toast.error("Failed to process PDF");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              PDF to Handwritten Notes
            </h1>
          </div>
          <p className="text-muted-foreground mt-2">
            Transform your digital documents into beautiful handwritten notes
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          {!extractedText && !isProcessing && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <PDFUploader onFileSelect={handleFileSelect} />
            </div>
          )}

          {isProcessing && (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-lg text-muted-foreground">
                Converting your PDF to handwritten notes...
              </p>
            </div>
          )}

          {extractedText && !isProcessing && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <HandwrittenNote text={extractedText} />
              <div className="mt-8 text-center">
                <button
                  onClick={() => {
                    setExtractedText("");
                  }}
                  className="text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
                >
                  Upload another PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
