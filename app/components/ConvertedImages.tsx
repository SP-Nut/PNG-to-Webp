'use client';

import Image from 'next/image';

interface ConvertedFile {
  id: string;
  originalName: string;
  webpBlob: Blob;
  preview: string;
  webpPreview: string;
}

interface ConvertedImagesProps {
  convertedFiles: ConvertedFile[];
  onDownload: (file: ConvertedFile) => void;
}

export function ConvertedImages({ convertedFiles, onDownload }: ConvertedImagesProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCompressionRatio = (originalSize: number, webpSize: number): number => {
    return Math.round(((originalSize - webpSize) / originalSize) * 100);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {convertedFiles.map((file, index) => {
          const compressionRatio = getCompressionRatio(file.webpBlob.size, file.webpBlob.size);

          return (
            <div
              key={file.id}
              className="group bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-300"
            >
              {/* File Number & Info */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-shrink-0 w-6 h-6 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 dark:text-white truncate" title={file.originalName}>
                    {file.originalName.length > 15 
                      ? file.originalName.substring(0, 15) + '...'
                      : file.originalName
                    }
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.webpBlob.size)}
                  </p>
                </div>
              </div>

              {/* WebP Preview - Single Image */}
              <div className="text-center mb-3">
                <div className="aspect-square relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                  <Image
                    src={file.webpPreview}
                    alt="Converted WebP"
                    fill
                    className="object-contain"
                    sizes="150px"
                  />
                  {/* Quality Badge */}
                  <div className="absolute top-1 right-1 px-1 py-0.5 bg-green-500 text-white text-xs rounded font-bold shadow-lg">
                    WebP
                  </div>
                </div>
              </div>

              {/* Download Button */}
              <button
                onClick={() => onDownload(file)}
                className="w-full px-2 py-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xs font-medium rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 flex items-center justify-center gap-1"
              >
                <span>📥</span>
                <span>ดาวน์โหลด</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Compact Summary */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">🎉</span>
            <h3 className="text-lg font-bold text-green-800 dark:text-green-300">
              แปลงเสร็จเรียบร้อย!
            </h3>
          </div>
          <div className="flex justify-center gap-4 text-sm text-green-700 dark:text-green-400">
            <span>✅ แปลงสำเร็จ {convertedFiles.length} ไฟล์</span>
            <span>💾 ขนาดเล็กลง คุณภาพยังคงสูง</span>
          </div>
        </div>
      </div>
    </div>
  );
}
