import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/lib/i18n';
import { ServiceFormSchema, SERVICE_INCLUDE_SUGGESTIONS } from '@/api/schemas/service.schema';
import type { ServiceFormData } from '@/api/schemas/service.schema';
import type { Service } from '@/hooks/useProviderServices';
import { ServiceImageUpload } from './ServiceImageUpload';
import { useProvider } from '@/hooks/useProvider';

interface ServiceFormProps {
  service?: Service | null;
  onSubmit: (data: ServiceFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const serviceTypeOptions = [
  { value: 'umrah' as const, labelEn: 'Umrah', labelAr: 'عمرة', icon: '🕋' },
  { value: 'hajj' as const, labelEn: 'Hajj', labelAr: 'حج', icon: '🏔️' },
  { value: 'ziyarat' as const, labelEn: 'Ziyarat', labelAr: 'زيارة', icon: '🕌' },
];

export function ServiceForm({ service, onSubmit, onCancel, isSubmitting }: ServiceFormProps) {
  const { t, isRTL } = useLanguage();
  const { provider } = useProvider();
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Parse existing includes from service
  const existingIncludes = (service?.includes as { en: string; ar: string }[] | null) || [];

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(ServiceFormSchema),
    defaultValues: {
      title: service?.title || '',
      title_ar: service?.title_ar || '',
      description: service?.description || '',
      description_ar: service?.description_ar || '',
      service_type: (service?.service_type as 'umrah' | 'hajj' | 'ziyarat') || 'umrah',
      price: service?.price || 0,
      currency: service?.currency || 'SAR',
      duration_days: service?.duration_days || undefined,
      is_active: service?.is_active ?? true,
      includes: existingIncludes.length > 0 ? existingIncludes : [],
      hero_image_url: (service as any)?.hero_image_url || null,
      gallery_urls: (service as any)?.gallery_urls || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'includes',
  });

  const handleSubmit = async (data: ServiceFormData) => {
    await onSubmit(data);
  };

  const addIncludeItem = () => {
    append({ en: '', ar: '' });
  };

  const addSuggestion = (suggestion: { en: string; ar: string }) => {
    // Check if already added
    const currentIncludes = form.getValues('includes') || [];
    if (currentIncludes.some(item => item.en === suggestion.en)) return;
    append(suggestion);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* Service Type */}
        <FormField
          control={form.control}
          name="service_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{isRTL ? 'نوع الخدمة' : 'Service Type'}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {serviceTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.icon} {isRTL ? option.labelAr : option.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Hero Image & Gallery */}
        {provider && (
          <div className="space-y-2">
            <FormLabel>{isRTL ? 'صور الخدمة' : 'Service Images'}</FormLabel>
            <ServiceImageUpload
              heroImage={form.watch('hero_image_url') || null}
              galleryImages={form.watch('gallery_urls') || []}
              onHeroImageChange={(url) => form.setValue('hero_image_url', url)}
              onGalleryChange={(urls) => form.setValue('gallery_urls', urls)}
              providerId={provider.id}
            />
          </div>
        )}

        <Separator />

        {/* Title Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{isRTL ? 'العنوان (بالإنجليزية)' : 'Title (English)'}</FormLabel>
                <FormControl>
                  <Input placeholder={isRTL ? 'أدخل العنوان' : 'Enter title'} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title_ar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{isRTL ? 'العنوان (بالعربية)' : 'Title (Arabic)'}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={isRTL ? 'أدخل العنوان بالعربية' : 'Enter title in Arabic'} 
                    dir="rtl"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description Fields */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{isRTL ? 'الوصف (بالإنجليزية)' : 'Description (English)'}</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={isRTL ? 'وصف تفصيلي للخدمة...' : 'Detailed service description...'}
                  rows={4}
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                {isRTL ? 'على الأقل 20 حرفاً' : 'At least 20 characters'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description_ar"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{isRTL ? 'الوصف (بالعربية)' : 'Description (Arabic)'}</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={isRTL ? 'أدخل الوصف بالعربية...' : 'Enter description in Arabic...'}
                  dir="rtl"
                  rows={4}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        {/* Price, Currency, Duration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.services.price}</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    min="1"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{isRTL ? 'العملة' : 'Currency'}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="SAR">SAR (ر.س)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration_days"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.services.duration} ({t.services.days})</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    min="1"
                    max="365"
                    placeholder="7"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* What's Included - Dynamic List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel className="text-base">
              {isRTL ? 'ما يشمله العرض' : "What's Included"}
            </FormLabel>
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setShowSuggestions(!showSuggestions)}
              >
                <Sparkles className="h-4 w-4 mr-1" />
                {isRTL ? 'اقتراحات' : 'Suggestions'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={addIncludeItem}
              >
                <Plus className="h-4 w-4 mr-1" />
                {isRTL ? 'إضافة' : 'Add Item'}
              </Button>
            </div>
          </div>

          {/* Suggestions */}
          {showSuggestions && (
            <div className="flex flex-wrap gap-2 p-4 bg-muted/50 rounded-lg">
              {SERVICE_INCLUDE_SUGGESTIONS.map((suggestion, idx) => {
                const currentIncludes = form.watch('includes') || [];
                const isAdded = currentIncludes.some(item => item.en === suggestion.en);
                return (
                  <Badge 
                    key={idx}
                    variant={isAdded ? "secondary" : "outline"}
                    className={`cursor-pointer transition-colors ${
                      isAdded ? 'opacity-50' : 'hover:bg-primary hover:text-primary-foreground'
                    }`}
                    onClick={() => !isAdded && addSuggestion(suggestion)}
                  >
                    {isAdded ? '✓ ' : '+ '}
                    {isRTL && suggestion.ar ? suggestion.ar : suggestion.en}
                  </Badge>
                );
              })}
            </div>
          )}

          {/* Dynamic Fields */}
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-3 items-start">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name={`includes.${index}.en`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input 
                            placeholder={isRTL ? 'بالإنجليزية' : 'English'} 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`includes.${index}.ar`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input 
                            placeholder={isRTL ? 'بالعربية' : 'Arabic'} 
                            dir="rtl"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {fields.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                {isRTL 
                  ? 'لم تتم إضافة أي عناصر بعد. انقر على "إضافة" أو اختر من الاقتراحات.'
                  : 'No items added yet. Click "Add Item" or choose from suggestions.'}
              </p>
            )}
          </div>
        </div>

        <Separator />

        {/* Active Toggle */}
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  {isRTL ? 'الخدمة نشطة' : 'Service Active'}
                </FormLabel>
                <FormDescription>
                  {isRTL 
                    ? 'عند التفعيل، ستظهر الخدمة للمسافرين'
                    : 'When active, the service will be visible to travelers'}
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            {t.common.cancel}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t.common.loading : t.common.save}
          </Button>
        </div>
      </form>
    </Form>
  );
}
