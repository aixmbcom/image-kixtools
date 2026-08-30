import React, { useState, useCallback } from 'react';
import { Image, Trash2, BookOpen } from 'lucide-react';
import { CompressionOptions } from './components/CompressionOptions';
import { DropZone } from './components/DropZone';
import { ImageList } from './components/ImageList';
import { DownloadAll } from './components/DownloadAll';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { useImageQueue } from './hooks/useImageQueue';
import { DEFAULT_QUALITY_SETTINGS } from './utils/formatDefaults';
import { useTranslation } from './i18n';
import type { ImageFile, OutputType, CompressionOptions as CompressionOptionsType } from './types';

export function App() {
  const { lang, t } = useTranslation();
  const [images, setImages] = useState<ImageFile[]>([]);
  const [outputType, setOutputType] = useState<OutputType>('webp');
  const [options, setOptions] = useState<CompressionOptionsType>({
    quality: DEFAULT_QUALITY_SETTINGS.webp,
  });

  const { addToQueue } = useImageQueue(options, outputType, setImages);

  const handleOutputTypeChange = useCallback((type: OutputType) => {
    setOutputType(type);
    if (type !== 'png') {
      setOptions({ quality: DEFAULT_QUALITY_SETTINGS[type] });
    }
  }, []);

  const handleFilesDrop = useCallback((newImages: ImageFile[]) => {
    // First add all images to state
    setImages((prev) => [...prev, ...newImages]);

    // Use requestAnimationFrame to wait for render to complete
    requestAnimationFrame(() => {
      // Then add to queue after UI has updated
      newImages.forEach(image => addToQueue(image.id));
    });
  }, [addToQueue]);

  const handleRemoveImage = useCallback((id: string) => {
    setImages((prev) => {
      const image = prev.find(img => img.id === id);
      if (image?.preview) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter(img => img.id !== id);
    });
  }, []);

  const handleClearAll = useCallback(() => {
    images.forEach(image => {
      if (image.preview) {
        URL.revokeObjectURL(image.preview);
      }
    });
    setImages([]);
  }, [images]);

  const handleDownloadAll = useCallback(async () => {
    const completedImages = images.filter((img) => img.status === "complete");

    for (const image of completedImages) {
      if (image.blob && image.outputType) {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(image.blob);
        link.download = `${image.file.name.split(".")[0]}.${image.outputType}`;
        link.click();
        URL.revokeObjectURL(link.href);
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }, [images]);

  const completedImages = images.filter(img => img.status === 'complete').length;
  const blogHref = lang === 'en' ? '/blog/' : '/zh-CN/blog/';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex justify-end mb-4">
          <LanguageSwitcher />
        </div>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Image className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-gray-900">{t.brand}</h1>
          </div>
          <p className="text-gray-600">{t.tagline}</p>
        </div>

        <div className="space-y-6">
          <CompressionOptions
            options={options}
            outputType={outputType}
            onOptionsChange={setOptions}
            onOutputTypeChange={handleOutputTypeChange}
          />

          <DropZone onFilesDrop={handleFilesDrop} />

          {completedImages > 0 && (
            <DownloadAll onDownloadAll={handleDownloadAll} count={completedImages} />
          )}

          <ImageList
            images={images}
            onRemove={handleRemoveImage}
          />

          {images.length > 0 && (
            <button
              onClick={handleClearAll}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              {t.clearAll}
            </button>
          )}

          <a
            href={blogHref}
            className="flex items-center gap-4 p-5 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all group"
          >
            <BookOpen className="w-8 h-8 text-blue-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900">{t.blogCardTitle}</p>
              <p className="text-sm text-gray-500">{t.blogCardDesc}</p>
            </div>
            <span className="text-sm font-medium text-blue-500 group-hover:translate-x-0.5 transition-transform whitespace-nowrap">
              {t.blogCardCta} →
            </span>
          </a>
        </div>

        <footer className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-400">
          <span>{t.footerBefore}</span>
          <a
            href="https://image-tools.667374.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 hover:underline"
          >
            {t.footerLink}
          </a>
          <span>{t.footerAfter}</span>
        </footer>
      </div>
    </div>
  );
}
