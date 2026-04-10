'use client';

import { useCallback, useState } from 'react';
import { Upload, ImagePlus, Shield, Layers } from 'lucide-react';

interface FileUploadProps {
  onFilesSelect: (files: File[]) => void;
}

export function FileUpload({ onFilesSelect }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const imageFiles = Array.from(files).filter(file => 
      file.type === 'image/png' || 
      file.type === 'image/jpeg' || 
      file.type === 'image/jpg' ||
      file.name.toLowerCase().endsWith('.png') ||
      file.name.toLowerCase().endsWith('.jpg') ||
      file.name.toLowerCase().endsWith('.jpeg')
    );

    if (imageFiles.length === 0) {
      alert('กรุณาเลือกไฟล์ PNG, JPG หรือ JPEG เท่านั้น');
      return;
    }

    onFilesSelect(imageFiles);
  }, [onFilesSelect]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  }, [handleFileSelect]);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`
        relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer
        ${isDragOver 
          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30' 
          : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
        }
      `}
    >
      <input
        type="file"
        accept=".png,.jpg,.jpeg,image/png,image/jpeg,image/jpg"
        multiple
        onChange={handleInputChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      
      <div className="space-y-4">
        <div className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 ${
          isDragOver 
            ? 'bg-indigo-500 text-white' 
            : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
        }`}>
          {isDragOver ? <Upload className="w-7 h-7" /> : <ImagePlus className="w-7 h-7" />}
        </div>
        
        <div>
          <p className="text-base font-semibold text-slate-800 dark:text-slate-100">
            {isDragOver ? 'วางไฟล์ที่นี่' : 'ลากไฟล์มาวาง หรือคลิกเพื่อเลือก'}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            รองรับ PNG, JPG, JPEG — เลือกได้หลายไฟล์
          </p>
        </div>
        
        <div className="flex items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> หลายไฟล์
          </span>
          <span className="inline-flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" /> ประมวลผลในเครื่อง
          </span>
        </div>
      </div>
    </div>
  );
}
