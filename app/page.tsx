'use client';

import { useState, useCallback } from 'react';
import JSZip from 'jszip';
import { FileUpload } from './components/FileUpload';
import { ImagePreview } from './components/ImagePreview';
import { ConvertedImages } from './components/ConvertedImages';
import {
  ArrowRightLeft,
  Download,
  Loader2,
  Trash2,
  SlidersHorizontal,
  Shield,
  Zap,
  Globe,
  PackageOpen,
  Maximize2,
  Lock,
  Unlock,
} from 'lucide-react';

interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
}

interface ConvertedFile {
  id: string;
  originalName: string;
  originalSize: number;
  webpBlob: Blob;
  preview: string;
  webpPreview: string;
}

export default function Home() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [isCreatingZip, setIsCreatingZip] = useState(false);
  const [quality, setQuality] = useState(0.85);
  const [resizeEnabled, setResizeEnabled] = useState(false);
  const [targetWidth, setTargetWidth] = useState<number | ''>('');
  const [targetHeight, setTargetHeight] = useState<number | ''>('');
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  const handleFilesSelect = useCallback((selectedFiles: File[]) => {
    const filesWithPreview = selectedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
    }));
    setFiles(prev => [...prev, ...filesWithPreview]);
    setConvertedFiles([]);
  }, []);

  const handleRemoveFile = useCallback((id: string) => {
    setFiles(prev => {
      const target = prev.find(f => f.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter(f => f.id !== id);
    });
  }, []);

  const convertToWebP = useCallback(async () => {
    if (files.length === 0) return;

    setIsConverting(true);
    const converted: ConvertedFile[] = [];

    for (const fp of files) {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            let drawWidth = img.width;
            let drawHeight = img.height;

            if (resizeEnabled && (targetWidth || targetHeight)) {
              if (targetWidth && targetHeight) {
                drawWidth = targetWidth;
                drawHeight = targetHeight;
              } else if (targetWidth) {
                drawWidth = targetWidth;
                drawHeight = Math.round(img.height * (targetWidth / img.width));
              } else if (targetHeight) {
                drawHeight = targetHeight;
                drawWidth = Math.round(img.width * (targetHeight / img.height));
              }
            }

            canvas.width = drawWidth;
            canvas.height = drawHeight;
            ctx?.drawImage(img, 0, 0, drawWidth, drawHeight);

            canvas.toBlob(
              (blob) => {
                if (blob) {
                  converted.push({
                    id: fp.id,
                    originalName: fp.file.name,
                    originalSize: fp.file.size,
                    webpBlob: blob,
                    preview: fp.preview,
                    webpPreview: URL.createObjectURL(blob),
                  });
                }
                resolve();
              },
              'image/webp',
              quality,
            );
          };
          img.onerror = reject;
          img.src = fp.preview;
        });
      } catch (error) {
        console.error('Error converting file:', error);
      }
    }

    setConvertedFiles(converted);
    setIsConverting(false);
  }, [files, quality, resizeEnabled, targetWidth, targetHeight]);

  const downloadFile = useCallback((cf: ConvertedFile) => {
    const url = URL.createObjectURL(cf.webpBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = cf.originalName.replace(/\.[^/.]+$/, '.webp');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const downloadAll = useCallback(async () => {
    if (convertedFiles.length === 0) return;

    setIsCreatingZip(true);
    try {
      const zip = new JSZip();
      convertedFiles.forEach((file) => {
        zip.file(file.originalName.replace(/\.[^/.]+$/, '.webp'), file.webpBlob);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `webp-images-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error creating ZIP:', error);
    } finally {
      setIsCreatingZip(false);
    }
  }, [convertedFiles]);

  const resetFiles = useCallback(() => {
    files.forEach(f => URL.revokeObjectURL(f.preview));
    convertedFiles.forEach(f => {
      URL.revokeObjectURL(f.preview);
      URL.revokeObjectURL(f.webpPreview);
    });
    setFiles([]);
    setConvertedFiles([]);
  }, [files, convertedFiles]);

  const qualityLabel = quality >= 0.9 ? 'สูงสุด' : quality >= 0.7 ? 'สูง' : quality >= 0.5 ? 'ปานกลาง' : 'ต่ำ';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Image → WebP
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            แปลง PNG / JPG เป็น WebP — ปลอดภัย ประมวลผลในเครื่องของคุณ
          </p>
        </header>

        <div className="space-y-6">
          {/* Upload area */}
          <FileUpload onFilesSelect={handleFilesSelect} />

          {/* Files selected */}
          {files.length > 0 && (
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-5">
              {/* Section header */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                  ไฟล์ที่เลือก ({files.length})
                </h2>
                <button
                  onClick={resetFiles}
                  className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> ล้างทั้งหมด
                </button>
              </div>

              <ImagePreview files={files} onRemove={handleRemoveFile} />

              {/* Resize controls */}
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                    <Maximize2 className="w-4 h-4 text-indigo-500" />
                    ปรับขนาด (px)
                  </div>
                  <button
                    onClick={() => {
                      setResizeEnabled(!resizeEnabled);
                      setConvertedFiles([]);
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      resizeEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        resizeEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {resizeEnabled && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">กว้าง (px)</label>
                        <input
                          type="number"
                          min={1}
                          max={10000}
                          placeholder="auto"
                          value={targetWidth}
                          onChange={(e) => {
                            const w = e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value) || 1);
                            setTargetWidth(w);
                            if (lockAspectRatio && aspectRatio && w !== '') {
                              setTargetHeight(Math.round(w / aspectRatio));
                            }
                            setConvertedFiles([]);
                          }}
                          onFocus={() => {
                            if (lockAspectRatio && files.length > 0 && !aspectRatio) {
                              const img = new window.Image();
                              img.onload = () => setAspectRatio(img.width / img.height);
                              img.src = files[0].preview;
                            }
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <button
                        onClick={() => {
                          setLockAspectRatio(!lockAspectRatio);
                          if (!lockAspectRatio && files.length > 0) {
                            const img = new window.Image();
                            img.onload = () => setAspectRatio(img.width / img.height);
                            img.src = files[0].preview;
                          }
                        }}
                        className="mt-5 p-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        title={lockAspectRatio ? 'ล็อกสัดส่วน' : 'ปลดล็อกสัดส่วน'}
                      >
                        {lockAspectRatio ? (
                          <Lock className="w-4 h-4 text-indigo-500" />
                        ) : (
                          <Unlock className="w-4 h-4 text-slate-400" />
                        )}
                      </button>

                      <div className="flex-1">
                        <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">สูง (px)</label>
                        <input
                          type="number"
                          min={1}
                          max={10000}
                          placeholder="auto"
                          value={targetHeight}
                          onChange={(e) => {
                            const h = e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value) || 1);
                            setTargetHeight(h);
                            if (lockAspectRatio && aspectRatio && h !== '') {
                              setTargetWidth(Math.round(h * aspectRatio));
                            }
                            setConvertedFiles([]);
                          }}
                          onFocus={() => {
                            if (lockAspectRatio && files.length > 0 && !aspectRatio) {
                              const img = new window.Image();
                              img.onload = () => setAspectRatio(img.width / img.height);
                              img.src = files[0].preview;
                            }
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      เว้นว่างเพื่อคำนวณอัตโนมัติ &middot; ใส่ทั้งสองค่าเพื่อกำหนดขนาดตายตัว
                    </p>
                  </div>
                )}
              </div>

              {/* Quality selector */}
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
                  คุณภาพ WebP
                </div>

                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={0.1}
                    max={1}
                    step={0.05}
                    value={quality}
                    onChange={(e) => {
                      setQuality(parseFloat(e.target.value));
                      setConvertedFiles([]);
                    }}
                    className="flex-1"
                  />
                  <div className="w-28 text-right">
                    <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                      {Math.round(quality * 100)}%
                    </span>
                    <span className="ml-1.5 text-xs text-slate-500 dark:text-slate-400">
                      {qualityLabel}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ค่าต่ำ = ไฟล์เล็กลงมาก แต่ภาพจะเสียคุณภาพ &middot; ค่าสูง = ภาพคมชัด ไฟล์ใหญ่กว่า
                </p>
              </div>

              {/* Convert button */}
              <button
                onClick={convertToWebP}
                disabled={isConverting}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-base font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white transition-colors"
              >
                {isConverting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    กำลังแปลง...
                  </>
                ) : (
                  <>
                    <ArrowRightLeft className="w-5 h-5" />
                    แปลงเป็น WebP
                  </>
                )}
              </button>
            </div>
          )}

          {/* Converted results */}
          {convertedFiles.length > 0 && (
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                  ผลลัพธ์
                </h2>
                {convertedFiles.length > 1 && (
                  <button
                    onClick={downloadAll}
                    disabled={isCreatingZip}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white transition-colors"
                  >
                    {isCreatingZip ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> สร้าง ZIP...
                      </>
                    ) : (
                      <>
                        <PackageOpen className="w-4 h-4" /> ดาวน์โหลดทั้งหมด (.zip)
                      </>
                    )}
                  </button>
                )}
              </div>

              <ConvertedImages
                convertedFiles={convertedFiles}
                onDownload={downloadFile}
              />
            </div>
          )}

          {/* Empty state help */}
          {files.length === 0 && convertedFiles.length === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              {[
                { icon: Shield, title: 'ปลอดภัย 100%', desc: 'ไฟล์ไม่ถูกอัปโหลดไปที่ไหน' },
                { icon: Zap, title: 'แปลงเร็ว', desc: 'ใช้ Browser ประมวลผลทันที' },
                { icon: Globe, title: 'รองรับภาษาไทย', desc: 'ชื่อไฟล์ภาษาไทยใช้ได้' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-center">
                  <Icon className="w-6 h-6 mx-auto text-indigo-500 mb-2" />
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-slate-400 dark:text-slate-500">
          <p>© {new Date().getFullYear()} Image to WebP Converter</p>
        </footer>
      </div>
    </div>
  );
}
