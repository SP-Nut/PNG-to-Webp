'use client';

import { useCallback, useState } from 'react';

interface FileUploadProps {
  onFilesSelect: (files: File[]) => void;
}

export function FileUpload({ onFilesSelect }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const pngFiles = Array.from(files).filter(file => 
      file.type === 'image/png' || file.name.toLowerCase().endsWith('.png')
    );

    if (pngFiles.length === 0) {
      alert('กรุณาเลือกไฟล์ PNG เท่านั้น');
      return;
    }

    onFilesSelect(pngFiles);
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
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 group cursor-pointer
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02]' 
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
          }
        `}
      >
        <input
          type="file"
          accept=".png,image/png"
          multiple
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-3">
          {/* Compact Icon */}
          <div className={`transition-all duration-300 ${isDragOver ? 'animate-bounce' : 'group-hover:scale-110'}`}>
            <div className="w-12 h-12 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xl text-white shadow-lg">
              {isDragOver ? '📥' : '📸'}
            </div>
          </div>
          
          {/* Compact Text */}
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              {isDragOver ? 'วางไฟล์ที่นี่!' : 'เลือกไฟล์ PNG'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {isDragOver 
                ? 'ปล่อยเพื่อเริ่มการอัปโหลด' 
                : 'ลากและวาง หรือคลิกเพื่อเลือก'
              }
            </p>
          </div>
          
          {/* Compact Feature Tags */}
          <div className="flex items-center justify-center gap-2">
            <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
              📎 หลายไฟล์
            </div>
            <div className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
              🔒 ปลอดภัย
            </div>
          </div>
        </div>
      </div>

      {/* Compact Info */}
      <div className="text-center text-xs text-gray-500 dark:text-gray-400">
        <p>✅ รองรับชื่อไฟล์ภาษาไทย | 🏠 ทำงานใน Browser</p>
      </div>
    </div>
  );
}
