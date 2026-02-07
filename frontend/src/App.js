import { useState, useCallback, useRef } from "react";
import "@/App.css";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { UploadCloud, FileImage, X, FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILES = 20;

export default function App() {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [pdfBlob, setPdfBlob] = useState(null);
  const fileInputRef = useRef(null);

  const validateAndAddFiles = useCallback((newFiles) => {
    const validFiles = [];
    
    for (const file of newFiles) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`"${file.name}" is not a supported format. Use JPG, PNG, or WEBP.`);
        continue;
      }
      validFiles.push(file);
    }
    
    setFiles((prev) => {
      const combined = [...prev, ...validFiles];
      if (combined.length > MAX_FILES) {
        toast.error(`Maximum ${MAX_FILES} images allowed.`);
        return combined.slice(0, MAX_FILES);
      }
      return combined;
    });
    
    // Clear PDF when new files added
    setPdfBlob(null);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    validateAndAddFiles(droppedFiles);
  }, [validateAndAddFiles]);

  const handleFileInput = useCallback((e) => {
    const selectedFiles = Array.from(e.target.files);
    validateAndAddFiles(selectedFiles);
    e.target.value = "";
  }, [validateAndAddFiles]);

  const removeFile = useCallback((index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPdfBlob(null);
  }, []);

  const clearAll = useCallback(() => {
    setFiles([]);
    setPdfBlob(null);
  }, []);

  const convertToPdf = useCallback(async () => {
    if (files.length === 0) return;
    
    setIsConverting(true);
    setPdfBlob(null);
    
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    
    try {
      const response = await axios.post(`${API}/convert-to-pdf`, formData, {
        responseType: "blob",
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      setPdfBlob(response.data);
      toast.success("PDF created successfully!");
    } catch (error) {
      const message = error.response?.data?.detail || "Conversion failed. Please try again.";
      toast.error(message);
    } finally {
      setIsConverting(false);
    }
  }, [files]);

  const downloadPdf = useCallback(() => {
    if (!pdfBlob) return;
    
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `converted_${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [pdfBlob]);

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-center" richColors />
      
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 
            data-testid="page-title"
            className="text-4xl md:text-5xl font-semibold text-neutral-950 tracking-tight"
          >
            Image to PDF Converter
          </h1>
          <p className="mt-4 text-base text-neutral-500">
            Convert images into a single PDF in seconds. No signup required.
          </p>
        </header>

        {/* Drop Zone */}
        <div
          data-testid="drop-zone"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative cursor-pointer
            border-2 border-dashed rounded-xl
            p-8 md:p-12
            flex flex-col items-center justify-center
            min-h-[200px]
            transition-colors duration-200 ease-out
            ${isDragging 
              ? "border-blue-600 bg-blue-50" 
              : "border-neutral-200 bg-neutral-50/50 hover:border-blue-400 hover:bg-blue-50/30"
            }
          `}
          role="button"
          aria-label="Upload images"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleFileInput}
            className="hidden"
            data-testid="file-input"
          />
          
          <UploadCloud 
            className={`w-12 h-12 mb-4 ${isDragging ? "text-blue-600" : "text-neutral-400"}`} 
          />
          <p className="text-neutral-950 font-medium text-center">
            Drag and drop images here
          </p>
          <p className="text-neutral-500 text-sm mt-1">
            or click to browse
          </p>
          <p className="text-neutral-400 text-xs mt-3">
            JPG, PNG, WEBP • Up to {MAX_FILES} images
          </p>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <p 
                data-testid="file-count"
                className="text-sm text-neutral-500"
              >
                {files.length} {files.length === 1 ? "image" : "images"} selected
              </p>
              <button
                data-testid="clear-all-btn"
                onClick={clearAll}
                className="text-sm text-neutral-500 hover:text-red-600 transition-colors"
              >
                Clear all
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  data-testid={`file-card-${index}`}
                  className="relative group aspect-[3/4] rounded-lg border border-neutral-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                  <button
                    data-testid={`remove-file-${index}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-red-50 text-neutral-500 hover:text-red-600 rounded-full p-1.5 shadow-sm"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <p className="text-white text-xs truncate">{file.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          {!pdfBlob ? (
            <Button
              data-testid="convert-btn"
              onClick={convertToPdf}
              disabled={files.length === 0 || isConverting}
              className="h-12 px-8 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConverting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <FileImage className="w-5 h-5 mr-2" />
                  Convert to PDF
                </>
              )}
            </Button>
          ) : (
            <Button
              data-testid="download-btn"
              onClick={downloadPdf}
              className="h-12 px-8 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
            >
              <FileDown className="w-5 h-5 mr-2" />
              Download PDF
            </Button>
          )}
        </div>

        {/* Security Note */}
        <div className="mt-16 text-center">
          <p className="text-xs text-neutral-400">
            Files are processed securely and automatically deleted after conversion.
          </p>
        </div>
      </div>

      {/* Bottom Section */}
      <section 
        data-testid="explore-section"
        className="w-full border-t border-neutral-200 bg-white"
      >
        <div className="h-[50px] md:h-[100px] flex items-center justify-center px-6">
          <p className="text-sm md:text-base text-neutral-500 text-center">
            Explore more simple and secure document tools designed to save time.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer 
        data-testid="footer"
        className="w-full border-t border-neutral-100 bg-white py-6"
      >
        <div className="max-w-3xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6">
          <a 
            href="/privacy" 
            data-testid="privacy-link"
            className="text-sm text-neutral-500 hover:text-neutral-950 transition-colors"
          >
            Privacy Policy
          </a>
          <a 
            href="/terms" 
            data-testid="terms-link"
            className="text-sm text-neutral-500 hover:text-neutral-950 transition-colors"
          >
            Terms of Use
          </a>
          <a 
            href="/about" 
            data-testid="about-link"
            className="text-sm text-neutral-500 hover:text-neutral-950 transition-colors"
          >
            About
          </a>
        </div>
      </footer>
    </div>
  );
}
