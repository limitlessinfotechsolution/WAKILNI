import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface ServiceImageUploadProps {
  heroImage: string | null;
  galleryImages: string[];
  onHeroImageChange: (url: string | null) => void;
  onGalleryChange: (urls: string[]) => void;
  providerId: string;
  maxGalleryImages?: number;
}

export function ServiceImageUpload({
  heroImage,
  galleryImages,
  onHeroImageChange,
  onGalleryChange,
  providerId,
  maxGalleryImages = 4,
}: ServiceImageUploadProps) {
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const uploadImage = useCallback(async (file: File, type: 'hero' | 'gallery') => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${providerId}/${Date.now()}-${type}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('service-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('service-images')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  }, [providerId]);

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'يرجى اختيار ملف صورة' : 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'حجم الصورة يجب أن يكون أقل من 5 ميجابايت' : 'Image must be less than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setUploadingHero(true);
    try {
      const url = await uploadImage(file, 'hero');
      onHeroImageChange(url);
      toast({
        title: isRTL ? 'تم الرفع' : 'Uploaded',
        description: isRTL ? 'تم رفع الصورة الرئيسية بنجاح' : 'Hero image uploaded successfully',
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل في رفع الصورة' : 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setUploadingHero(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = maxGalleryImages - galleryImages.length;
    if (files.length > remaining) {
      toast({
        title: isRTL ? 'تنبيه' : 'Warning',
        description: isRTL 
          ? `يمكنك إضافة ${remaining} صور فقط`
          : `You can only add ${remaining} more images`,
        variant: 'destructive',
      });
      return;
    }

    setUploadingGallery(true);
    try {
      const uploadPromises = files.map(file => uploadImage(file, 'gallery'));
      const urls = await Promise.all(uploadPromises);
      onGalleryChange([...galleryImages, ...urls]);
      toast({
        title: isRTL ? 'تم الرفع' : 'Uploaded',
        description: isRTL ? 'تم رفع الصور بنجاح' : 'Gallery images uploaded successfully',
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل في رفع بعض الصور' : 'Failed to upload some images',
        variant: 'destructive',
      });
    } finally {
      setUploadingGallery(false);
    }
  };

  const removeHeroImage = () => {
    onHeroImageChange(null);
  };

  const removeGalleryImage = (index: number) => {
    const newGallery = galleryImages.filter((_, i) => i !== index);
    onGalleryChange(newGallery);
  };

  return (
    <div className="space-y-6">
      {/* Hero Image */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {isRTL ? 'الصورة الرئيسية' : 'Hero Image'}
        </label>
        {heroImage ? (
          <div className="relative aspect-video rounded-lg overflow-hidden border border-border">
            <img 
              src={heroImage} 
              alt="Hero" 
              className="w-full h-full object-cover"
            />
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2"
              onClick={removeHeroImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <label className={cn(
            "flex flex-col items-center justify-center h-48 rounded-lg border-2 border-dashed cursor-pointer",
            "border-muted-foreground/25 hover:border-primary/50 transition-colors",
            uploadingHero && "opacity-50 pointer-events-none"
          )}>
            <input
              type="file"
              accept="image/*"
              onChange={handleHeroUpload}
              className="hidden"
              disabled={uploadingHero}
            />
            {uploadingHero ? (
              <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
            ) : (
              <>
                <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {isRTL ? 'اسحب أو انقر لرفع الصورة الرئيسية' : 'Drag or click to upload hero image'}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {isRTL ? 'الحد الأقصى 5 ميجابايت' : 'Max 5MB'}
                </p>
              </>
            )}
          </label>
        )}
      </div>

      {/* Gallery Images */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {isRTL ? 'معرض الصور' : 'Gallery'} ({galleryImages.length}/{maxGalleryImages})
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {galleryImages.map((url, index) => (
            <div 
              key={index} 
              className="relative aspect-square rounded-lg overflow-hidden border border-border"
            >
              <img 
                src={url} 
                alt={`Gallery ${index + 1}`} 
                className="w-full h-full object-cover"
              />
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute top-1 right-1 h-6 w-6"
                onClick={() => removeGalleryImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
          
          {galleryImages.length < maxGalleryImages && (
            <label className={cn(
              "flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed cursor-pointer",
              "border-muted-foreground/25 hover:border-primary/50 transition-colors",
              uploadingGallery && "opacity-50 pointer-events-none"
            )}>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryUpload}
                className="hidden"
                disabled={uploadingGallery}
              />
              {uploadingGallery ? (
                <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
              ) : (
                <>
                  <ImageIcon className="h-6 w-6 text-muted-foreground mb-1" />
                  <p className="text-xs text-muted-foreground text-center px-2">
                    {isRTL ? 'إضافة صور' : 'Add images'}
                  </p>
                </>
              )}
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
