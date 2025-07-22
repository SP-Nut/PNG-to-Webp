'use client';

import { useState, useCallback } from 'react';
import JSZip from 'jszip';
import { FileUpload } from './components/FileUpload';
import { ImagePreview } from './components/ImagePreview';
import { ConvertedImages } from './components/ConvertedImages';

interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
}

interface ConvertedFile {
  id: string;
  originalName: string;
  webpBlob: Blob;
  preview: string;
  webpPreview: string;
}

export default function Home() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [isCreatingZip, setIsCreatingZip] = useState(false);

  const handleFilesSelect = useCallback((selectedFiles: File[]) => {
    const filesWithPreview = selectedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));
    setFiles(filesWithPreview);
    setConvertedFiles([]);
  }, []);

  const convertToWebP = useCallback(async () => {
    if (files.length === 0) return;

    setIsConverting(true);
    const converted: ConvertedFile[] = [];

    for (const fileWithPreview of files) {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            
            canvas.toBlob((blob) => {
              if (blob) {
                const webpPreview = URL.createObjectURL(blob);
                converted.push({
                  id: fileWithPreview.id,
                  originalName: fileWithPreview.file.name,
                  webpBlob: blob,
                  preview: fileWithPreview.preview,
                  webpPreview
                });
              }
              resolve();
            }, 'image/webp', 0.9);
          };
          img.onerror = reject;
          img.src = fileWithPreview.preview;
        });
      } catch (error) {
        console.error('Error converting file:', error);
      }
    }

    setConvertedFiles(converted);
    setIsConverting(false);
  }, [files]);

  const downloadFile = useCallback((convertedFile: ConvertedFile) => {
    const url = URL.createObjectURL(convertedFile.webpBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = convertedFile.originalName.replace(/\.[^/.]+$/, '.webp');
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
      
      // เพิ่มไฟล์ WebP ทั้งหมดลงใน ZIP
      convertedFiles.forEach((file) => {
        const fileName = file.originalName.replace(/\.[^/.]+$/, '.webp');
        zip.file(fileName, file.webpBlob);
      });
      
      // สร้าง ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // ดาวน์โหลด ZIP file
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `converted-webp-images-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error creating ZIP file:', error);
    } finally {
      setIsCreatingZip(false);
    }
  }, [convertedFiles]);

  const resetFiles = useCallback(() => {
    files.forEach(file => URL.revokeObjectURL(file.preview));
    convertedFiles.forEach(file => {
      URL.revokeObjectURL(file.preview);
      URL.revokeObjectURL(file.webpPreview);
    });
    setFiles([]);
    setConvertedFiles([]);
  }, [files, convertedFiles]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative container mx-auto px-4 py-4">
        {/* Compact Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
            PNG to WebP Converter
          </h1>
          <div className="flex justify-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
              🔒 ปลอดภัย
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
              ⚡ ทำงานใน Browser
            </span>
          </div>
        </div>

        {/* Single Card Layout */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-4 sm:p-6">
            
            {/* Step Progress Bar - Compact */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-2">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium transition-all ${files.length === 0 ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}`}>
                  1
                </div>
                <div className={`h-0.5 w-8 rounded transition-all ${files.length > 0 ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium transition-all ${files.length === 0 ? 'bg-gray-300 dark:bg-gray-600 text-gray-500' : convertedFiles.length === 0 ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}`}>
                  2
                </div>
                <div className={`h-0.5 w-8 rounded transition-all ${convertedFiles.length > 0 ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium transition-all ${convertedFiles.length === 0 ? 'bg-gray-300 dark:bg-gray-600 text-gray-500' : 'bg-green-500 text-white'}`}>
                  3
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left Column - Upload & Preview */}
              <div className="space-y-4">
                {/* File Upload Section - Compact */}
                <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-4">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                    <span className="text-xl">📁</span>
                    เลือกไฟล์ PNG
                  </h2>
                  <FileUpload onFilesSelect={handleFilesSelect} />
                </div>

                {/* Image Preview Section - Compact */}
                {files.length > 0 && (
                  <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                        <span className="text-xl">🖼️</span>
                        ไฟล์ที่เลือก ({files.length})
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={resetFiles}
                          className="px-3 py-1 text-xs text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors border border-gray-300 dark:border-gray-600 rounded-lg"
                        >
                          🗑️ ลบ
                        </button>
                        <button
                          onClick={convertToWebP}
                          disabled={isConverting}
                          className="px-4 py-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-blue-400 disabled:to-purple-400 text-white text-xs font-medium rounded-lg transition-all shadow-lg hover:shadow-xl disabled:shadow-md transform hover:scale-105 disabled:scale-100 inline-flex items-center gap-2"
                        >
                          {isConverting ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                              แปลง...
                            </>
                          ) : (
                            <>
                              🔄 แปลง
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    <ImagePreview files={files} />
                  </div>
                )}
              </div>

              {/* Right Column - Converted Results */}
              <div className="space-y-4">
                {convertedFiles.length > 0 && (
                  <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                        <span className="text-xl">✅</span>
                        ไฟล์ที่แปลงแล้ว ({convertedFiles.length})
                      </h3>
                      {convertedFiles.length > 1 && (
                        <button
                          onClick={downloadAll}
                          disabled={isCreatingZip}
                          className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-green-400 disabled:to-emerald-400 text-white text-sm font-medium rounded-lg transition-all shadow-lg hover:shadow-xl disabled:shadow-md transform hover:scale-105 disabled:scale-100 inline-flex items-center gap-2"
                        >
                          {isCreatingZip ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              สร้าง ZIP...
                            </>
                          ) : (
                            <>
                              📦 ดาวน์โหลดทั้งหมด
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

                {/* Instructions/Help Panel */}
                {files.length === 0 && convertedFiles.length === 0 && (
                  <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 bg-gray-50 dark:bg-gray-700/50">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                      <span className="text-xl">💡</span>
                      วิธีใช้งาน
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">1.</span>
                        <span>เลือกไฟล์ PNG ที่ต้องการแปลง (รองรับหลายไฟล์)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">2.</span>
                        <span>ตรวจสอบไฟล์และคลิก "แปลง"</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">3.</span>
                        <span>ดาวน์โหลดไฟล์ WebP ที่แปลงแล้ว</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                          <span>🔒</span>
                          <span>ปลอดภัย 100%</span>
                        </div>
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                          <span>⚡</span>
                          <span>แปลงเร็ว</span>
                        </div>
                        <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                          <span>🌍</span>
                          <span>รองรับภาษาไทย</span>
                        </div>
                        <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                          <span>💾</span>
                          <span>ขนาดเล็กลง</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Compact Footer */}
        <footer className="mt-6 text-center text-gray-600 dark:text-gray-400">
          <div className="text-xs space-y-1">
            <p className="flex items-center justify-center gap-2 flex-wrap">
              <span>© 2025 PNG to WebP Converter</span>
              <span>|</span>
              <span className="flex items-center gap-1">
                ทำด้วย ❤️ โดย 
                <a href="https://nonie001.github.io/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors hover:underline">
                  Anas.dev
                </a>
              </span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              🔒 การแปลงไฟล์ทำงานใน Browser ของคุณ ไฟล์จะไม่ถูกอัปโหลดไปยัง Server ใดๆ
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
