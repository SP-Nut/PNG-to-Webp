'use client';

import Image from 'next/image';
import { FileImage, HardDrive, X } from 'lucide-react';

interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
}

interface ImagePreviewProps {
  files: FileWithPreview[];
  onRemove: (id: string) => void;
}

export function ImagePreview({ files, onRemove }: ImagePreviewProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileExt = (name: string): string => {
    const ext = name.split('.').pop()?.toUpperCase() || '';
    return ext === 'JPEG' ? 'JPG' : ext;
  };

  const totalSize = files.reduce((sum, f) => sum + f.file.size, 0);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {files.map((fp) => (
          <div
            key={fp.id}
            className="group relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-shadow hover:shadow-md"
          >
            <button
              onClick={() => onRemove(fp.id)}
              className="absolute top-1.5 right-1.5 z-10 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="aspect-square relative bg-slate-100 dark:bg-slate-900">
              <Image
                src={fp.preview}
                alt={fp.file.name}
                fill
                className="object-contain"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </div>

            <div className="p-2 space-y-1">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate" title={fp.file.name}>
                {fp.file.name}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>{formatFileSize(fp.file.size)}</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-medium">
                  {getFileExt(fp.file.name)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400 py-2">
        <span className="inline-flex items-center gap-1">
          <FileImage className="w-3.5 h-3.5" /> {files.length} ไฟล์
        </span>
        <span className="inline-flex items-center gap-1">
          <HardDrive className="w-3.5 h-3.5" /> {formatFileSize(totalSize)}
        </span>
      </div>
    </div>
  );
}
