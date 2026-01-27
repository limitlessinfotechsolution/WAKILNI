import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { useLanguage } from '@/lib/i18n';
import type { Service, ServiceType } from '@/hooks/useProviderServices';

const serviceSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  title_ar: z.string().max(100).optional(),
  description: z.string().min(20, 'Description must be at least 20 characters').max(1000),
  description_ar: z.string().max(1000).optional(),
  service_type: z.enum(['umrah', 'hajj', 'ziyarat']),
  price: z.number().min(1, 'Price must be at least 1'),
  currency: z.string().default('SAR'),
  duration_days: z.number().min(1).max(365).optional(),
  is_active: z.boolean().default(true),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
  service?: Service | null;
  onSubmit: (data: ServiceFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const serviceTypeOptions: { value: ServiceType; labelEn: string; labelAr: string }[] = [
  { value: 'umrah', labelEn: 'Umrah', labelAr: 'عمرة' },
  { value: 'hajj', labelEn: 'Hajj', labelAr: 'حج' },
  { value: 'ziyarat', labelEn: 'Ziyarat', labelAr: 'زيارة' },
];

export function ServiceForm({ service, onSubmit, onCancel, isSubmitting }: ServiceFormProps) {
  const { t, isRTL } = useLanguage();

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      title: service?.title || '',
      title_ar: service?.title_ar || '',
      description: service?.description || '',
      description_ar: service?.description_ar || '',
      service_type: (service?.service_type as ServiceType) || 'umrah',
      price: service?.price || 0,
      currency: service?.currency || 'SAR',
      duration_days: service?.duration_days || undefined,
      is_active: service?.is_active ?? true,
    },
  });

  const handleSubmit = async (data: ServiceFormData) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
                      {isRTL ? option.labelAr : option.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

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
