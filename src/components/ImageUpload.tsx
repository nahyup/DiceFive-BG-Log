import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { compressImage } from '../lib/imageUtils';

interface ImageUploadProps {
  value?: string | string[]; // Single URL or array of URLs
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
}

export default function ImageUpload({ value, onChange, multiple = false }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Normalize current images to standard Array format for uniform rendering
  const images = Array.isArray(value) ? value : (value ? [value] : []);

  const handleFiles = async (files: FileList | File[]) => {
    setIsProcessing(true);
    try {
      const newImages: string[] = [];
      const filesArray = Array.from(files).filter(file => file.type.startsWith('image/'));

      for (let i = 0; i < filesArray.length; i++) {
        // If single mode, just process the first valid image
        if (!multiple && i > 0) break;
        
        const compressedBase64 = await compressImage(filesArray[i]);
        newImages.push(compressedBase64);
      }

      if (newImages.length > 0) {
        if (multiple) {
          onChange([...images, ...newImages]);
        } else {
          onChange(newImages[0]);
        }
      }
    } catch (error) {
      console.error('Failed to compress image:', error);
      alert('Failed to process image. It might be corrupted or too large.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (indexToRemove: number) => {
    if (multiple) {
      onChange(images.filter((_, i) => i !== indexToRemove));
    } else {
      onChange('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Existing Images Preview */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {images.map((img, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-surface-200 dark:border-surface-700 group">
              <img src={img} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-sm"
                  title="Remove image"
                >
                  <X size={16} strokeWidth={3} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Dropzone */}
      {(!images.length || multiple) && (
        <div 
          className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer overflow-hidden ${
            isDragging 
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
              : 'border-surface-300 dark:border-surface-600 hover:border-primary-400 hover:bg-surface-50 dark:hover:bg-surface-800/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept="image/*"
            multiple={multiple}
            onChange={(e) => {
              if (e.target.files?.length) handleFiles(e.target.files);
              e.target.value = ''; // Reset the input to allow selecting the same file again
            }}
          />
          
          <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
            {isProcessing ? (
              <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                <Upload size={24} />
              </div>
            )}
            <div>
              <p className="font-semibold text-surface-900 dark:text-white">
                {isProcessing ? 'Processing image...' : 'Click or drop to upload photo'}
              </p>
              <p className="text-sm text-surface-500 max-w-[200px] mx-auto mt-1">
                {multiple ? 'Supports multiple JPEG/PNG files' : 'Select a single JPEG/PNG file'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
