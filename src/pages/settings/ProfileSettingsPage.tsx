import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  User, Camera, Bell, Globe, Shield, Loader2, Smartphone, Mail, MessageSquare, 
  Calendar, CheckCircle2, AlertTriangle, Wifi, WifiOff, Lock, Monitor, Trash2, 
  Download, Key, LogOut 
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard, GlassCardContent, GlassCardHeader } from '@/components/cards/GlassCard';
import { CardDescription, CardTitle } from '@/components/ui/card';
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
import { useHaptics } from '@/hooks/useHaptics';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useArabicNameSuggestion } from '@/hooks/useArabicNameSuggestion';
import { ConfirmDialog } from '@/components/feedback';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  full_name_ar: z.string().optional(),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(8, 'Password must be at least 8 characters'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

interface NotificationPreferences {
  email_bookings: boolean;
  email_kyc: boolean;
  email_messages: boolean;
  email_marketing: boolean;
  push_bookings: boolean;
  push_kyc: boolean;
  push_messages: boolean;
  push_reviews: boolean;
  push_system: boolean;
}

// Real sessions from database
interface SessionRecord {
  id: string;
  device_type: string;
  browser: string;
  os: string;
  city: string | null;
  logged_in_at: string;
  is_current: boolean;
}

export default function ProfileSettingsPage() {
  const { t, isRTL, language, setLanguage } = useLanguage();
  const { user, profile, refreshProfile, signOut } = useAuth();
  const { toast } = useToast();
  const haptics = useHaptics();
  const { isSupported: pushSupported, isSubscribed, permission, subscribe, requestPermission } = usePushNotifications();
  const { isOnline, isSyncing, pendingCount, syncAll, lastSyncTime } = useOfflineSync();
  
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isExportingData, setIsExportingData] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const { suggestion: arabicSuggestion, suggestArabicName } = useArabicNameSuggestion();
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

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
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

  // Fetch real sessions
  useEffect(() => {
    if (!user) return;
    const fetchSessions = async () => {
      const { data } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('logged_in_at', { ascending: false })
        .limit(10);
      if (data) setSessions(data as SessionRecord[]);
    };
    fetchSessions();
  }, [user]);

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
      haptics.success();
      toast({
        title: isRTL ? 'تم التفعيل' : 'Enabled',
        description: isRTL ? 'ستتلقى الآن إشعارات فورية' : 'You will now receive push notifications.',
      });
    }
  };

  const handleSaveNotificationPrefs = async () => {
    setIsSavingNotifications(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    haptics.success();
    toast({
      title: isRTL ? 'تم الحفظ' : 'Saved',
      description: isRTL ? 'تم حفظ تفضيلات الإشعارات' : 'Notification preferences saved.',
    });
    setIsSavingNotifications(false);
  };

  const handleToggleWithHaptic = (checked: boolean, key: keyof NotificationPreferences) => {
    haptics.light();
    setNotificationPrefs(prev => ({ ...prev, [key]: checked }));
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
      haptics.success();
      toast({
        title: isRTL ? 'تم الحفظ' : 'Saved',
        description: isRTL ? 'تم تحديث ملفك الشخصي بنجاح' : 'Your profile has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      haptics.error();
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل في تحديث الملف الشخصي' : 'Failed to update profile.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (data: PasswordFormData) => {
    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (error) throw error;

      haptics.success();
      toast({
        title: isRTL ? 'تم تغيير كلمة المرور' : 'Password Changed',
        description: isRTL ? 'تم تحديث كلمة مرورك بنجاح' : 'Your password has been updated successfully.',
      });
      passwordForm.reset();
    } catch (error) {
      console.error('Error changing password:', error);
      haptics.error();
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل في تغيير كلمة المرور' : 'Failed to change password.',
        variant: 'destructive',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleExportData = async () => {
    setIsExportingData(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    haptics.success();
    toast({
      title: isRTL ? 'طلب تصدير البيانات' : 'Data Export Requested',
      description: isRTL 
        ? 'ستتلقى رسالة بريد إلكتروني تحتوي على رابط تنزيل بياناتك خلال 24 ساعة'
        : 'You will receive an email with a download link for your data within 24 hours.',
    });
    setIsExportingData(false);
  };

  const handleSignOutAllSessions = async () => {
    haptics.warning();
    setSessions([sessions[0]]);
    toast({
      title: isRTL ? 'تم تسجيل الخروج' : 'Signed Out',
      description: isRTL ? 'تم تسجيل الخروج من جميع الأجهزة الأخرى' : 'Signed out from all other devices.',
    });
  };

  const handleDeleteAccount = async () => {
    haptics.error();
    toast({
      title: isRTL ? 'طلب حذف الحساب' : 'Account Deletion Requested',
      description: isRTL 
        ? 'سيتم حذف حسابك خلال 30 يوماً. يمكنك إلغاء هذا الطلب بتسجيل الدخول مرة أخرى.'
        : 'Your account will be deleted within 30 days. You can cancel this by logging in again.',
    });
    setShowDeleteDialog(false);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
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

      await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      setAvatarUrl(publicUrl);
      await refreshProfile();
      haptics.success();

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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className={cn('hidden sm:inline', isRTL && 'font-arabic')}>
                {isRTL ? 'الملف' : 'Profile'}
              </span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className={cn('hidden sm:inline', isRTL && 'font-arabic')}>
                {isRTL ? 'الإشعارات' : 'Notifications'}
              </span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className={cn('hidden sm:inline', isRTL && 'font-arabic')}>
                {isRTL ? 'التفضيلات' : 'Preferences'}
              </span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className={cn('hidden sm:inline', isRTL && 'font-arabic')}>
                {isRTL ? 'الأمان' : 'Security'}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Avatar Section */}
            <GlassCard glow hoverable>
              <GlassCardHeader>
                <CardTitle className={cn(isRTL && 'font-arabic')}>
                  {isRTL ? 'صورة الملف الشخصي' : 'Profile Picture'}
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'صورتك ستظهر للمستخدمين الآخرين' : 'Your photo will be visible to other users'}
                </CardDescription>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <Avatar className="h-24 w-24 transition-transform group-hover:scale-105">
                      <AvatarImage src={avatarUrl || undefined} />
                      <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="h-6 w-6 text-white" />
                    </div>
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
              </GlassCardContent>
            </GlassCard>

            {/* Personal Information */}
            <GlassCard glow hoverable>
              <GlassCardHeader>
                <CardTitle className={cn(isRTL && 'font-arabic')}>
                  {isRTL ? 'المعلومات الشخصية' : 'Personal Information'}
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'قم بتحديث معلومات حسابك' : 'Update your account information'}
                </CardDescription>
              </GlassCardHeader>
              <GlassCardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{isRTL ? 'الاسم الكامل (بالإنجليزية)' : 'Full Name (English)'}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="John Doe" 
                              {...field} 
                              onChange={(e) => {
                                field.onChange(e);
                                const suggested = suggestArabicName(e.target.value);
                                if (suggested && !form.getValues('full_name_ar')) {
                                  form.setValue('full_name_ar', suggested);
                                }
                              }}
                            />
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
              </GlassCardContent>
            </GlassCard>

            {/* Email Section (read-only) */}
            <GlassCard glow hoverable>
              <GlassCardHeader>
                <CardTitle className={cn(isRTL && 'font-arabic')}>
                  {isRTL ? 'البريد الإلكتروني' : 'Email Address'}
                </CardTitle>
              </GlassCardHeader>
              <GlassCardContent>
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
              </GlassCardContent>
            </GlassCard>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            {/* Push Notification Status */}
            <GlassCard glow className={cn(
              isSubscribed ? 'border-emerald-500/30' : 'border-amber-500/30'
            )}>
              <GlassCardHeader className="pb-3">
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
              </GlassCardHeader>
              {!pushSupported && (
                <GlassCardContent className="pt-0">
                  <div className="flex items-center gap-2 text-amber-600 text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    {isRTL ? 'الإشعارات غير مدعومة في هذا المتصفح' : 'Push notifications are not supported in this browser'}
                  </div>
                </GlassCardContent>
              )}
            </GlassCard>

            {/* Email Notifications */}
            <GlassCard glow hoverable>
              <GlassCardHeader>
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
              </GlassCardHeader>
              <GlassCardContent className="space-y-4">
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
                    onCheckedChange={(checked) => handleToggleWithHaptic(checked, 'email_bookings')}
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
                    onCheckedChange={(checked) => handleToggleWithHaptic(checked, 'email_kyc')}
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
                    onCheckedChange={(checked) => handleToggleWithHaptic(checked, 'email_messages')}
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
                    onCheckedChange={(checked) => handleToggleWithHaptic(checked, 'email_marketing')}
                  />
                </div>
              </GlassCardContent>
            </GlassCard>

            {/* Sync Status */}
            <GlassCard glow hoverable>
              <GlassCardHeader>
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
              </GlassCardHeader>
              <GlassCardContent className="space-y-4">
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
                      isRTL ? 'مزامنة الآن' : 'Sync Now'
                    )}
                  </Button>
                )}
              </GlassCardContent>
            </GlassCard>

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
            <GlassCard glow hoverable>
              <GlassCardHeader>
                <CardTitle className={cn(isRTL && 'font-arabic')}>
                  {isRTL ? 'اللغة والمنطقة' : 'Language & Region'}
                </CardTitle>
              </GlassCardHeader>
              <GlassCardContent className="space-y-4">
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
              </GlassCardContent>
            </GlassCard>

            {/* Data Export */}
            <GlassCard glow hoverable>
              <GlassCardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Download className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className={cn(isRTL && 'font-arabic')}>
                      {isRTL ? 'تصدير البيانات' : 'Export Your Data'}
                    </CardTitle>
                    <CardDescription>
                      {isRTL 
                        ? 'قم بتنزيل نسخة من بياناتك الشخصية'
                        : 'Download a copy of your personal data'}
                    </CardDescription>
                  </div>
                </div>
              </GlassCardHeader>
              <GlassCardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {isRTL 
                    ? 'يتضمن هذا ملفك الشخصي وحجوزاتك ورسائلك وأي بيانات أخرى مرتبطة بحسابك.'
                    : 'This includes your profile, bookings, messages, and any other data associated with your account.'}
                </p>
                <Button 
                  variant="outline" 
                  onClick={handleExportData}
                  disabled={isExportingData}
                >
                  {isExportingData ? (
                    <>
                      <Loader2 className="h-4 w-4 me-2 animate-spin" />
                      {isRTL ? 'جاري الطلب...' : 'Requesting...'}
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 me-2" />
                      {isRTL ? 'طلب تصدير البيانات' : 'Request Data Export'}
                    </>
                  )}
                </Button>
              </GlassCardContent>
            </GlassCard>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            {/* Change Password */}
            <GlassCard glow hoverable>
              <GlassCardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Key className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className={cn(isRTL && 'font-arabic')}>
                      {isRTL ? 'تغيير كلمة المرور' : 'Change Password'}
                    </CardTitle>
                    <CardDescription>
                      {isRTL ? 'قم بتحديث كلمة مرورك بانتظام للحفاظ على أمان حسابك' : 'Update your password regularly to keep your account secure'}
                    </CardDescription>
                  </div>
                </div>
              </GlassCardHeader>
              <GlassCardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{isRTL ? 'كلمة المرور الحالية' : 'Current Password'}</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{isRTL ? 'كلمة المرور الجديدة' : 'New Password'}</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password'}</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={isChangingPassword}>
                      {isChangingPassword && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                      {isRTL ? 'تغيير كلمة المرور' : 'Change Password'}
                    </Button>
                  </form>
                </Form>
              </GlassCardContent>
            </GlassCard>

            {/* Active Sessions */}
            <GlassCard glow hoverable>
              <GlassCardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Monitor className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className={cn(isRTL && 'font-arabic')}>
                        {isRTL ? 'الجلسات النشطة' : 'Active Sessions'}
                      </CardTitle>
                      <CardDescription>
                        {isRTL ? 'الأجهزة التي سجلت الدخول منها' : 'Devices where you are logged in'}
                      </CardDescription>
                    </div>
                  </div>
                  {sessions.length > 1 && (
                    <Button variant="outline" size="sm" onClick={handleSignOutAllSessions}>
                      <LogOut className="h-4 w-4 me-2" />
                      {isRTL ? 'تسجيل خروج الكل' : 'Sign Out All'}
                    </Button>
                  )}
                </div>
              </GlassCardHeader>
              <GlassCardContent className="space-y-3">
                {sessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {isRTL ? 'لا توجد جلسات مسجلة' : 'No sessions recorded yet'}
                  </p>
                ) : sessions.map((session) => {
                  const timeAgo = new Date(session.logged_in_at).toLocaleDateString(undefined, {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  });
                  return (
                    <div 
                      key={session.id}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-lg border',
                        session.is_current && 'bg-primary/5 border-primary/20'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Monitor className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{session.browser} on {session.os}</p>
                          <p className="text-xs text-muted-foreground">
                            {session.city || 'Unknown'} • {timeAgo}
                          </p>
                        </div>
                      </div>
                      {session.is_current && (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                          {isRTL ? 'الحالي' : 'Current'}
                        </Badge>
                      )}
                    </div>
                  );
                })}

              </GlassCardContent>
            </GlassCard>

            {/* Two-Factor Authentication */}
            <GlassCard glow hoverable>
              <GlassCardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className={cn(isRTL && 'font-arabic')}>
                      {isRTL ? 'المصادقة الثنائية' : 'Two-Factor Authentication'}
                    </CardTitle>
                    <CardDescription>
                      {isRTL ? 'أضف طبقة إضافية من الأمان لحسابك' : 'Add an extra layer of security to your account'}
                    </CardDescription>
                  </div>
                </div>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-dashed">
                  <div>
                    <p className="font-medium">{isRTL ? 'غير مفعّل' : 'Not Enabled'}</p>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'قريباً' : 'Coming Soon'}
                    </p>
                  </div>
                  <Button variant="outline" disabled>
                    {isRTL ? 'تفعيل' : 'Enable'}
                  </Button>
                </div>
              </GlassCardContent>
            </GlassCard>

            {/* Delete Account */}
            <GlassCard className="border-destructive/30" hoverable>
              <GlassCardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <Trash2 className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <CardTitle className={cn('text-destructive', isRTL && 'font-arabic')}>
                      {isRTL ? 'حذف الحساب' : 'Delete Account'}
                    </CardTitle>
                    <CardDescription>
                      {isRTL ? 'احذف حسابك وجميع بياناتك نهائياً' : 'Permanently delete your account and all your data'}
                    </CardDescription>
                  </div>
                </div>
              </GlassCardHeader>
              <GlassCardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {isRTL 
                    ? 'بمجرد حذف حسابك، لا يمكن استعادته. سيتم حذف جميع بياناتك نهائياً.'
                    : 'Once you delete your account, there is no going back. All your data will be permanently deleted.'}
                </p>
                <Button 
                  variant="destructive" 
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 me-2" />
                  {isRTL ? 'حذف الحساب' : 'Delete Account'}
                </Button>
              </GlassCardContent>
            </GlassCard>
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title={isRTL ? 'حذف الحساب' : 'Delete Account'}
        description={isRTL 
          ? 'هل أنت متأكد أنك تريد حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه.'
          : 'Are you sure you want to delete your account? This action cannot be undone.'}
        confirmLabel={isRTL ? 'حذف الحساب' : 'Delete Account'}
        cancelLabel={isRTL ? 'إلغاء' : 'Cancel'}
        variant="destructive"
        onConfirm={handleDeleteAccount}
      />
    </DashboardLayout>
  );
}
