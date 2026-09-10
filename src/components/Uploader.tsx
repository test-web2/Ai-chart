import React, { useCallback, useState } from "react";
import { UploadCloud, X, Loader2, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploaderProps {
  onAnalyze: (file: File) => void;
  isAnalyzing: boolean;
}

export function Uploader({ onAnalyze, isAnalyzing }: UploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) return;
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleClear = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
      {!file ? (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "relative flex flex-col items-center justify-center w-full h-72 rounded-3xl border-2 border-dashed cursor-pointer transition-all duration-300",
            isDragging
              ? "border-blue-500 bg-blue-500/10 shadow-[0_0_40px_rgba(59,130,246,0.15)]"
              : "border-slate-700 bg-slate-900/50 hover:bg-slate-800/80 hover:border-slate-500"
          )}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-400">
            <div className="w-16 h-16 mb-4 rounded-full bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UploadCloud className="w-8 h-8 text-blue-400" />
            </div>
            <p className="mb-2 text-xl font-semibold text-slate-200">رفع صورة الشارت</p>
            <p className="text-sm text-slate-500 font-medium">PNG, JPG, WEBP (Drag & Drop)</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/png, image/jpeg, image/webp"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFile(e.target.files[0]);
              }
            }}
          />
        </label>
      ) : (
        <div className="relative w-full rounded-3xl overflow-hidden border border-slate-700/50 bg-slate-900 p-2 shadow-xl">
          <div className="relative rounded-2xl overflow-hidden bg-black/50 aspect-video flex items-center justify-center group">
            <img
              src={previewUrl!}
              alt="Chart preview"
              className="max-w-full max-h-[60vh] object-contain"
            />
            {!isAnalyzing && (
              <button
                onClick={handleClear}
                className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-red-500/80 text-white rounded-full backdrop-blur-sm transition-colors"
                title="حذف الصورة"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {file && (
        <div className="flex justify-center mt-2">
          <button
            onClick={() => onAnalyze(file)}
            disabled={isAnalyzing}
            className={cn(
              "relative px-12 py-4 rounded-full font-bold text-lg overflow-hidden transition-all duration-300 w-full sm:w-auto min-w-[240px]",
              isAnalyzing
                ? "bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-blue-500/25 hover:scale-105 hover:from-blue-500 hover:to-indigo-500 border border-blue-500/30"
            )}
          >
            {isAnalyzing ? (
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>جاري التحليل...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <ImageIcon className="w-5 h-5" />
                <span>بدء التحليل الفني</span>
              </div>
            )}
          </button>
        </div>
      )}

      {isAnalyzing && (
        <div className="w-full max-w-md mx-auto space-y-3">
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full animate-pulse w-[80%] transition-all duration-[20s] ease-out"></div>
          </div>
          <p className="text-center text-sm text-slate-400 font-medium">يتم معالجة البيانات الفنية بالذكاء الاصطناعي...</p>
        </div>
      )}
    </div>
  );
}
