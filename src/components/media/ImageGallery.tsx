import * as React from 'react';
import { cn } from '@/lib/utils';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHaptics } from '@/hooks/useHaptics';

interface ImageGalleryProps {
  images: {
    src: string;
    alt?: string;
    caption?: string;
  }[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  showThumbnails?: boolean;
  showDownload?: boolean;
}

export function ImageGallery({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  showThumbnails = true,
  showDownload = false,
}: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
  const [zoom, setZoom] = React.useState(1);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const { trigger } = useHaptics();

  const currentImage = images[currentIndex];

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setCurrentIndex(initialIndex);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialIndex]);

  const goTo = (index: number) => {
    setCurrentIndex(index);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    trigger('selection');
  };

  const goNext = () => {
    if (currentIndex < images.length - 1) {
      goTo(currentIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      goTo(currentIndex - 1);
    }
  };

  const toggleZoom = () => {
    setZoom(zoom === 1 ? 2 : 1);
    setPosition({ x: 0, y: 0 });
    trigger('light');
  };

  const handleKeyDown = React.useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowLeft':
        goPrev();
        break;
      case 'ArrowRight':
        goNext();
        break;
    }
  }, [isOpen, currentIndex]);

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Touch handling for swipe
  const [touchStart, setTouchStart] = React.useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom > 1) return;
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || zoom > 1) return;
    const diff = touchStart.x - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
    setTouchStart(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white">
        <span className="text-sm font-medium">
          {currentIndex + 1} / {images.length}
        </span>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleZoom}
            className="text-white hover:bg-white/10"
          >
            {zoom === 1 ? <ZoomIn className="h-5 w-5" /> : <ZoomOut className="h-5 w-5" />}
          </Button>
          
          {showDownload && (
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="text-white hover:bg-white/10"
            >
              <a href={currentImage.src} download target="_blank" rel="noopener">
                <Download className="h-5 w-5" />
              </a>
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main image area */}
      <div 
        className="flex-1 flex items-center justify-center relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Previous button */}
        {currentIndex > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={goPrev}
            className="absolute left-4 z-10 text-white hover:bg-white/10 hidden md:flex"
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
        )}

        {/* Image */}
        <div
          className="relative transition-transform duration-200"
          style={{
            transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
          }}
        >
          <img
            src={currentImage.src}
            alt={currentImage.alt || ''}
            className="max-h-[70vh] max-w-[90vw] object-contain select-none"
            onClick={toggleZoom}
            draggable={false}
          />
        </div>

        {/* Next button */}
        {currentIndex < images.length - 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={goNext}
            className="absolute right-4 z-10 text-white hover:bg-white/10 hidden md:flex"
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        )}
      </div>

      {/* Caption */}
      {currentImage.caption && (
        <div className="text-center text-white/80 text-sm py-2 px-4">
          {currentImage.caption}
        </div>
      )}

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <div className="flex justify-center gap-2 p-4 overflow-x-auto scrollbar-hide">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              className={cn(
                'w-16 h-16 rounded-lg overflow-hidden shrink-0 transition-all',
                'border-2',
                index === currentIndex 
                  ? 'border-white opacity-100' 
                  : 'border-transparent opacity-50 hover:opacity-75'
              )}
            >
              <img
                src={image.src}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Simple thumbnail grid for use outside the gallery
interface ImageGridProps {
  images: { src: string; alt?: string; caption?: string }[];
  onImageClick?: (index: number) => void;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function ImageGrid({ 
  images, 
  onImageClick, 
  columns = 3,
  className 
}: ImageGridProps) {
  const [galleryOpen, setGalleryOpen] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const handleClick = (index: number) => {
    if (onImageClick) {
      onImageClick(index);
    } else {
      setSelectedIndex(index);
      setGalleryOpen(true);
    }
  };

  const columnClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  return (
    <>
      <div className={cn('grid gap-2', columnClasses[columns], className)}>
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => handleClick(index)}
            className="aspect-square rounded-xl overflow-hidden group relative"
          >
            <img
              src={image.src}
              alt={image.alt || ''}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          </button>
        ))}
      </div>

      <ImageGallery
        images={images}
        initialIndex={selectedIndex}
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
      />
    </>
  );
}
