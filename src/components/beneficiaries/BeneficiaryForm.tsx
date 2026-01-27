import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { Beneficiary, BeneficiaryStatus } from '@/hooks/useBeneficiaries';

const beneficiarySchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  full_name_ar: z.string().max(100).optional(),
  date_of_birth: z.date().optional(),
  nationality: z.string().max(50).optional(),
  status: z.enum(['deceased', 'sick', 'elderly', 'disabled', 'other']),
  status_notes: z.string().max(500).optional(),
});

type BeneficiaryFormData = z.infer<typeof beneficiarySchema>;

interface BeneficiaryFormProps {
  beneficiary?: Beneficiary | null;
  onSubmit: (data: BeneficiaryFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const statusOptions: { value: BeneficiaryStatus; labelEn: string; labelAr: string }[] = [
  { value: 'deceased', labelEn: 'Deceased', labelAr: 'متوفى' },
  { value: 'sick', labelEn: 'Sick', labelAr: 'مريض' },
  { value: 'elderly', labelEn: 'Elderly', labelAr: 'كبير في السن' },
  { value: 'disabled', labelEn: 'Disabled', labelAr: 'ذو إعاقة' },
  { value: 'other', labelEn: 'Other', labelAr: 'أخرى' },
];

export function BeneficiaryForm({ beneficiary, onSubmit, onCancel, isSubmitting }: BeneficiaryFormProps) {
  const { t, isRTL } = useLanguage();

  const form = useForm<BeneficiaryFormData>({
    resolver: zodResolver(beneficiarySchema),
    defaultValues: {
      full_name: beneficiary?.full_name || '',
      full_name_ar: beneficiary?.full_name_ar || '',
      date_of_birth: beneficiary?.date_of_birth ? new Date(beneficiary.date_of_birth) : undefined,
      nationality: beneficiary?.nationality || '',
      status: (beneficiary?.status as BeneficiaryStatus) || 'deceased',
      status_notes: beneficiary?.status_notes || '',
    },
  });

  const handleSubmit = async (data: BeneficiaryFormData) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{isRTL ? 'الاسم الكامل (بالإنجليزية)' : 'Full Name (English)'}</FormLabel>
                <FormControl>
                  <Input placeholder={isRTL ? 'أدخل الاسم' : 'Enter name'} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="full_name_ar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{isRTL ? 'الاسم الكامل (بالعربية)' : 'Full Name (Arabic)'}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={isRTL ? 'أدخل الاسم بالعربية' : 'Enter name in Arabic'} 
                    dir="rtl"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date_of_birth"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t.beneficiaries.dateOfBirth}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full ps-3 text-start font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>{isRTL ? 'اختر التاريخ' : 'Pick a date'}</span>
                        )}
                        <CalendarIcon className="ms-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date('1900-01-01')
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nationality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.beneficiaries.nationality}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={isRTL ? 'مثال: سعودي' : 'e.g., Saudi Arabian'} 
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
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.beneficiaries.status}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={isRTL ? 'اختر الحالة' : 'Select status'} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {statusOptions.map((option) => (
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

        <FormField
          control={form.control}
          name="status_notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.beneficiaries.statusNotes}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={isRTL ? 'أضف ملاحظات إضافية...' : 'Add additional notes...'}
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
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
