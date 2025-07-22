'use client';

import Image from 'next/image';

interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
}

interface ImagePreviewProps {
  files: FileWithPreview[];
}

export function ImagePreview({ files }: ImagePreviewProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
        {files.map((fileWithPreview, index) => (
          <div
            key={fileWithPreview.id}
            className="group bg-gray-50 dark:bg-gray-700 rounded-lg p-2 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            {/* Compact Image Container */}
            <div className="aspect-square relative mb-2 bg-white dark:bg-gray-900 rounded-md overflow-hidden shadow-inner">
              <Image
                src={fileWithPreview.preview}
                alt={fileWithPreview.file.name}
                fill
                className="object-contain transition-transform duration-300 group-hover:scale-110"
                sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 16vw"
              />
              {/* File Number Badge */}
              <div className="absolute top-1 left-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg">
                {index + 1}
              </div>
            </div>
            
            {/* Compact File Info */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-800 dark:text-white truncate" title={fileWithPreview.file.name}>
                {fileWithPreview.file.name.length > 12 
                  ? fileWithPreview.file.name.substring(0, 12) + '...'
                  : fileWithPreview.file.name
                }
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(fileWithPreview.file.size)}
                </span>
                <span className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded">
                  PNG
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Compact Summary */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <div className="flex items-center justify-center gap-4 text-sm text-blue-800 dark:text-blue-300">
          <span className="flex items-center gap-1">
            📊 <strong>{files.length}</strong> ไฟล์
          </span>
          <span className="flex items-center gap-1">
            💾 <strong>{formatFileSize(files.reduce((total, file) => total + file.file.size, 0))}</strong>
          </span>
          <span className="flex items-center gap-1">
            ✨ พร้อมแปลง
          </span>
        </div>
      </div>
    </div>
  );
}
