'use client';

import Image from 'next/image';
import { Download, TrendingDown, CheckCircle2 } from 'lucide-react';

interface ConvertedFile {
  id: string;
  originalName: string;
  originalSize: number;
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
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const totalOriginal = convertedFiles.reduce((s, f) => s + f.originalSize, 0);
  const totalWebp = convertedFiles.reduce((s, f) => s + f.webpBlob.size, 0);
  const totalSaved = totalOriginal > 0 ? Math.round(((totalOriginal - totalWebp) / totalOriginal) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex items-center gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-4 py-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
        <div className="flex-1 text-sm text-emerald-800 dark:text-emerald-300">
          แปลงสำเร็จ <strong>{convertedFiles.length}</strong> ไฟล์
        </div>
        <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
          <TrendingDown className="w-4 h-4" />
          ลดลง {totalSaved}%
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {convertedFiles.map((file) => {
          const saved = file.originalSize > 0
            ? Math.round(((file.originalSize - file.webpBlob.size) / file.originalSize) * 100)
            : 0;

          return (
            <div
              key={file.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <div className="aspect-video relative bg-slate-100 dark:bg-slate-900">
                <Image
                  src={file.webpPreview}
                  alt="Converted WebP"
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
                <span className="absolute top-2 left-2 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-600 text-white">
                  WebP
                </span>
              </div>

              <div className="p-3 space-y-2">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate" title={file.originalName}>
                  {file.originalName.replace(/\.[^/.]+$/, '.webp')}
                </p>

                {/* Size comparison */}
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>{formatFileSize(file.originalSize)}</span>
                  <span className="text-slate-300 dark:text-slate-600">→</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">{formatFileSize(file.webpBlob.size)}</span>
                  <span className={`ml-auto font-semibold px-1.5 py-0.5 rounded ${
                    saved > 0
                      ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                      : 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40'
                  }`}>
                    {saved > 0 ? `-${saved}%` : `+${Math.abs(saved)}%`}
                  </span>
                </div>

                <button
                  onClick={() => onDownload(file)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                >
                  <Download className="w-4 h-4" />
                  ดาวน์โหลด
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
