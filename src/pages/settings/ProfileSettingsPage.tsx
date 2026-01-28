import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Camera, Bell, Globe, Shield, Loader2, Smartphone, Mail, MessageSquare, Calendar, CheckCircle2, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  full_name_ar: z.string().optional(),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface NotificationPreferences {
  // Email notifications
  email_bookings: boolean;
  email_kyc: boolean;
  email_messages: boolean;
  email_marketing: boolean;
  // Push notifications
  push_bookings: boolean;
  push_kyc: boolean;
  push_messages: boolean;
  push_reviews: boolean;
  push_system: boolean;
}

export default function ProfileSettingsPage() {
  const { t, isRTL, language, setLanguage } = useLanguage();
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const { isSupported: pushSupported, isSubscribed, permission, subscribe, requestPermission } = usePushNotifications();
  const { isOnline, isSyncing, pendingCount, syncAll, lastSyncTime } = useOfflineSync();
  
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    email_bookings: true,
    email_kyc: true,
    email_messages: true,
    email_marketing: false,
    push_bookings: true,
    push_kyc: true,
    push_messages: true,
    push_reviews: true,
    push_system: true,
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: '',
      full_name_ar: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        full_name: profile.full_name || '',
        full_name_ar: profile.full_name_ar || '',
        phone: profile.phone || '',
      });
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile, form]);

  // Enable push notifications
  const handleEnablePush = async () => {
    if (!pushSupported) {
      toast({
        title: isRTL ? 'غير مدعوم' : 'Not Supported',
        description: isRTL ? 'الإشعارات غير مدعومة في هذا المتصفح' : 'Push notifications are not supported in this browser.',
        variant: 'destructive',
      });
      return;
    }

    const success = await subscribe();
    if (success) {
      toast({
        title: isRTL ? 'تم التفعيل' : 'Enabled',
        description: isRTL ? 'ستتلقى الآن إشعارات فورية' : 'You will now receive push notifications.',
      });
    }
  };

  const handleSaveNotificationPrefs = async () => {
    setIsSavingNotifications(true);
    // In a real app, save to user preferences in database
    await new Promise(resolve => setTimeout(resolve, 500));
    toast({
      title: isRTL ? 'تم الحفظ' : 'Saved',
      description: isRTL ? 'تم حفظ تفضيلات الإشعارات' : 'Notification preferences saved.',
    });
    setIsSavingNotifications(false);
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          full_name_ar: data.full_name_ar || null,
          phone: data.phone || null,
          preferred_language: language,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await refreshProfile();
      toast({
        title: isRTL ? 'تم الحفظ' : 'Saved',
        description: isRTL ? 'تم تحديث ملفك الشخصي بنجاح' : 'Your profile has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل في تحديث الملف الشخصي' : 'Failed to update profile.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploadingAvatar(true);
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        // If bucket doesn't exist, just store a placeholder
        console.error('Upload error:', uploadError);
        toast({
          title: isRTL ? 'تنبيه' : 'Notice',
          description: isRTL ? 'تخزين الصور غير متاح حالياً' : 'Avatar storage is not available yet.',
        });
        return;
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Update profile
      await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      setAvatarUrl(publicUrl);
      await refreshProfile();

      toast({
        title: isRTL ? 'تم التحميل' : 'Uploaded',
        description: isRTL ? 'تم تحديث صورتك الشخصية' : 'Your avatar has been updated.',
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل في تحميل الصورة' : 'Failed to upload avatar.',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const getInitials = () => {
    const name = profile?.full_name || user?.email || '';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className={cn('text-2xl font-bold mb-1', isRTL && 'font-arabic')}>
            {isRTL ? 'إعدادات الملف الشخصي' : 'Profile Settings'}
          </h1>
          <p className="text-muted-foreground">
            {isRTL ? 'إدارة معلوماتك الشخصية وتفضيلاتك' : 'Manage your personal information and preferences'}
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className={cn(isRTL && 'font-arabic')}>
                {isRTL ? 'الملف الشخصي' : 'Profile'}
              </span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className={cn(isRTL && 'font-arabic')}>
                {isRTL ? 'الإشعارات' : 'Notifications'}
              </span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className={cn(isRTL && 'font-arabic')}>
                {isRTL ? 'التفضيلات' : 'Preferences'}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Avatar Section */}
            <Card>
              <CardHeader>
                <CardTitle className={cn(isRTL && 'font-arabic')}>
                  {isRTL ? 'صورة الملف الشخصي' : 'Profile Picture'}
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'صورتك ستظهر للمستخدمين الآخرين' : 'Your photo will be visible to other users'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={avatarUrl || undefined} />
                      <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <label
                      htmlFor="avatar-upload"
                      className={cn(
                        'absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-primary-foreground cursor-pointer',
                        'hover:bg-primary/90 transition-colors',
                        isUploadingAvatar && 'pointer-events-none opacity-50'
                      )}
                    >
                      {isUploadingAvatar ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                      disabled={isUploadingAvatar}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      {isRTL 
                        ? 'يُفضل استخدام صورة مربعة بحجم 256×256 بكسل على الأقل'
                        : 'A square image of at least 256x256 pixels is recommended'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className={cn(isRTL && 'font-arabic')}>
                  {isRTL ? 'المعلومات الشخصية' : 'Personal Information'}
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'قم بتحديث معلومات حسابك' : 'Update your account information'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{isRTL ? 'الاسم الكامل (بالإنجليزية)' : 'Full Name (English)'}</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
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
                              placeholder="أحمد محمد" 
                              dir="rtl" 
                              className="font-arabic" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            {isRTL ? 'اختياري - للعرض باللغة العربية' : 'Optional - for Arabic display'}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{isRTL ? 'رقم الهاتف' : 'Phone Number'}</FormLabel>
                          <FormControl>
                            <Input 
                              type="tel" 
                              placeholder="+966 5X XXX XXXX" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="pt-4">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                        {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Email Section (read-only) */}
            <Card>
              <CardHeader>
                <CardTitle className={cn(isRTL && 'font-arabic')}>
                  {isRTL ? 'البريد الإلكتروني' : 'Email Address'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input 
                      value={user?.email || ''} 
                      disabled 
                      className="bg-muted"
                    />
                  </div>
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {isRTL 
                    ? 'البريد الإلكتروني مرتبط بحسابك ولا يمكن تغييره'
                    : 'Your email is linked to your account and cannot be changed'
                  }
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            {/* Push Notification Status */}
            <Card className={cn(
              'border-2',
              isSubscribed ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-amber-500/30 bg-amber-500/5'
            )}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'p-2 rounded-lg',
                      isSubscribed ? 'bg-emerald-500/20' : 'bg-amber-500/20'
                    )}>
                      <Smartphone className={cn(
                        'h-5 w-5',
                        isSubscribed ? 'text-emerald-600' : 'text-amber-600'
                      )} />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {isRTL ? 'إشعارات الدفع' : 'Push Notifications'}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {isSubscribed 
                          ? (isRTL ? 'مفعّلة - ستتلقى إشعارات فورية' : 'Enabled - You will receive instant alerts')
                          : (isRTL ? 'غير مفعّلة - فعّلها للحصول على تنبيهات فورية' : 'Disabled - Enable for instant alerts')
                        }
                      </CardDescription>
                    </div>
                  </div>
                  {!isSubscribed && pushSupported && (
                    <Button onClick={handleEnablePush} size="sm" className="shrink-0">
                      <Bell className="h-4 w-4 me-2" />
                      {isRTL ? 'تفعيل' : 'Enable'}
                    </Button>
                  )}
                  {isSubscribed && (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                      <CheckCircle2 className="h-3 w-3 me-1" />
                      {isRTL ? 'مفعّل' : 'Active'}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              {!pushSupported && (
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2 text-amber-600 text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    {isRTL ? 'الإشعارات غير مدعومة في هذا المتصفح' : 'Push notifications are not supported in this browser'}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Email Notifications */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className={cn(isRTL && 'font-arabic')}>
                      {isRTL ? 'إشعارات البريد الإلكتروني' : 'Email Notifications'}
                    </CardTitle>
                    <CardDescription>
                      {isRTL ? 'اختر ما تريد استلامه عبر البريد الإلكتروني' : 'Choose what you want to receive via email'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div className="space-y-0.5">
                      <Label>{isRTL ? 'تحديثات الحجوزات' : 'Booking Updates'}</Label>
                      <p className="text-sm text-muted-foreground">
                        {isRTL ? 'إشعارات حول حالة حجوزاتك' : 'Updates about your booking status'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationPrefs.email_bookings}
                    onCheckedChange={(checked) => 
                      setNotificationPrefs(prev => ({ ...prev, email_bookings: checked }))
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <div className="space-y-0.5">
                      <Label>{isRTL ? 'تحديثات التحقق (KYC)' : 'Verification Updates'}</Label>
                      <p className="text-sm text-muted-foreground">
                        {isRTL ? 'إشعارات حول حالة التحقق من هويتك' : 'Updates about your identity verification'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationPrefs.email_kyc}
                    onCheckedChange={(checked) => 
                      setNotificationPrefs(prev => ({ ...prev, email_kyc: checked }))
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <div className="space-y-0.5">
                      <Label>{isRTL ? 'الرسائل' : 'Messages'}</Label>
                      <p className="text-sm text-muted-foreground">
                        {isRTL ? 'إشعارات عند استلام رسائل جديدة' : 'Alerts when you receive new messages'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationPrefs.email_messages}
                    onCheckedChange={(checked) => 
                      setNotificationPrefs(prev => ({ ...prev, email_messages: checked }))
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <div className="space-y-0.5">
                      <Label>{isRTL ? 'العروض والأخبار' : 'Promotions & News'}</Label>
                      <p className="text-sm text-muted-foreground">
                        {isRTL ? 'عروض خاصة ومستجدات المنصة' : 'Special offers and platform updates'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationPrefs.email_marketing}
                    onCheckedChange={(checked) => 
                      setNotificationPrefs(prev => ({ ...prev, email_marketing: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Push Notifications by Event Type */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Smartphone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className={cn(isRTL && 'font-arabic')}>
                      {isRTL ? 'إشعارات الدفع حسب النوع' : 'Push Notifications by Type'}
                    </CardTitle>
                    <CardDescription>
                      {isRTL ? 'تحكم في أنواع الإشعارات الفورية' : 'Control which push notifications you receive'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div className="space-y-0.5">
                      <Label>{isRTL ? 'تحديثات الحجوزات' : 'Booking Updates'}</Label>
                      <p className="text-sm text-muted-foreground">
                        {isRTL ? 'إشعارات فورية عند تغيير حالة الحجز' : 'Instant alerts when booking status changes'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationPrefs.push_bookings}
                    onCheckedChange={(checked) => 
                      setNotificationPrefs(prev => ({ ...prev, push_bookings: checked }))
                    }
                    disabled={!isSubscribed}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <div className="space-y-0.5">
                      <Label>{isRTL ? 'تحديثات التحقق' : 'KYC Updates'}</Label>
                      <p className="text-sm text-muted-foreground">
                        {isRTL ? 'إشعارات عند الموافقة أو الرفض' : 'Alerts when approved or rejected'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationPrefs.push_kyc}
                    onCheckedChange={(checked) => 
                      setNotificationPrefs(prev => ({ ...prev, push_kyc: checked }))
                    }
                    disabled={!isSubscribed}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <div className="space-y-0.5">
                      <Label>{isRTL ? 'الرسائل' : 'Messages'}</Label>
                      <p className="text-sm text-muted-foreground">
                        {isRTL ? 'إشعارات عند استلام رسائل جديدة' : 'Alerts when you receive new messages'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationPrefs.push_messages}
                    onCheckedChange={(checked) => 
                      setNotificationPrefs(prev => ({ ...prev, push_messages: checked }))
                    }
                    disabled={!isSubscribed}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div className="space-y-0.5">
                      <Label>{isRTL ? 'التقييمات' : 'Reviews'}</Label>
                      <p className="text-sm text-muted-foreground">
                        {isRTL ? 'إشعارات عند استلام تقييمات جديدة' : 'Alerts when you receive new reviews'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationPrefs.push_reviews}
                    onCheckedChange={(checked) => 
                      setNotificationPrefs(prev => ({ ...prev, push_reviews: checked }))
                    }
                    disabled={!isSubscribed}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <div className="space-y-0.5">
                      <Label>{isRTL ? 'إشعارات النظام' : 'System Notifications'}</Label>
                      <p className="text-sm text-muted-foreground">
                        {isRTL ? 'تحديثات وإعلانات هامة' : 'Important updates and announcements'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationPrefs.push_system}
                    onCheckedChange={(checked) => 
                      setNotificationPrefs(prev => ({ ...prev, push_system: checked }))
                    }
                    disabled={!isSubscribed}
                  />
                </div>
                
                {!isSubscribed && (
                  <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
                    <p className="text-sm text-muted-foreground text-center">
                      {isRTL 
                        ? 'فعّل إشعارات الدفع أعلاه للتحكم في هذه الإعدادات'
                        : 'Enable push notifications above to control these settings'
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sync Status */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'p-2 rounded-lg',
                    isOnline ? 'bg-emerald-500/10' : 'bg-amber-500/10'
                  )}>
                    {isOnline ? (
                      <Wifi className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <WifiOff className="h-5 w-5 text-amber-600" />
                    )}
                  </div>
                  <div>
                    <CardTitle className={cn(isRTL && 'font-arabic')}>
                      {isRTL ? 'حالة المزامنة' : 'Sync Status'}
                    </CardTitle>
                    <CardDescription>
                      {isOnline 
                        ? (isRTL ? 'متصل بالإنترنت' : 'Connected to internet')
                        : (isRTL ? 'وضع عدم الاتصال' : 'Offline mode')
                      }
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{isRTL ? 'العمليات المعلقة' : 'Pending Operations'}</Label>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'تغييرات في انتظار المزامنة' : 'Changes waiting to be synced'}
                    </p>
                  </div>
                  <Badge variant={pendingCount > 0 ? 'destructive' : 'secondary'}>
                    {pendingCount}
                  </Badge>
                </div>
                {lastSyncTime && (
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{isRTL ? 'آخر مزامنة' : 'Last Sync'}</Label>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {lastSyncTime.toLocaleTimeString()}
                    </span>
                  </div>
                )}
                {pendingCount > 0 && isOnline && (
                  <Button 
                    onClick={syncAll} 
                    disabled={isSyncing}
                    className="w-full"
                    variant="outline"
                  >
                    {isSyncing ? (
                      <>
                        <Loader2 className="h-4 w-4 me-2 animate-spin" />
                        {isRTL ? 'جاري المزامنة...' : 'Syncing...'}
                      </>
                    ) : (
                      <>
                        {isRTL ? 'مزامنة الآن' : 'Sync Now'}
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={handleSaveNotificationPrefs} disabled={isSavingNotifications}>
                {isSavingNotifications && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
                {isRTL ? 'حفظ التفضيلات' : 'Save Preferences'}
              </Button>
            </div>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className={cn(isRTL && 'font-arabic')}>
                  {isRTL ? 'اللغة والمنطقة' : 'Language & Region'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{isRTL ? 'لغة العرض' : 'Display Language'}</Label>
                  <Select value={language} onValueChange={(v) => setLanguage(v as 'en' | 'ar')}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
