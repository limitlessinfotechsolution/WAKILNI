import { useState } from 'react';
import { 
  Settings, Power, AlertTriangle, Users, Calendar, Heart, 
  Shield, RefreshCw, Server, Zap, Database
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/lib/i18n';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { GlassCard, GlassCardContent, GlassCardHeader } from '@/components/cards/GlassCard';
import { RingChart } from '@/components/data-display/RingChart';
import { cn } from '@/lib/utils';
import type { Json } from '@/integrations/supabase/types';

export default function SystemSettingsPage() {
  const { isRTL } = useLanguage();
  const { isSuperAdmin } = useAuth();
  const { settings, isLoading, updateSetting, getSettingValue, isMaintenanceMode, isEmergencyShutdown } = useSystemSettings();

  const [shutdownDialogOpen, setShutdownDialogOpen] = useState(false);
  const [shutdownReason, setShutdownReason] = useState('');

  // Get current setting values
  const maintenanceMode = getSettingValue<{ enabled: boolean; message: string }>('maintenance_mode', { enabled: false, message: '' });
  const registrationEnabled = getSettingValue<{ travelers: boolean; providers: boolean; vendors: boolean }>('registration_enabled', { travelers: true, providers: true, vendors: true });
  const bookingEnabled = getSettingValue<{ enabled: boolean }>('booking_enabled', { enabled: true });
  const donationsEnabled = getSettingValue<{ enabled: boolean; minimum_amount: number }>('donations_enabled', { enabled: true, minimum_amount: 10 });
  const emergencyShutdown = getSettingValue<{ enabled: boolean; reason: string }>('emergency_shutdown', { enabled: false, reason: '' });
  const platformFees = getSettingValue<{ provider_percentage: number; vendor_percentage: number }>('platform_fees', { provider_percentage: 10, vendor_percentage: 15 });

  const handleToggle = async (key: string, currentValue: Json, field: string) => {
    if (typeof currentValue === 'object' && currentValue !== null && !Array.isArray(currentValue)) {
      const newValue = { ...currentValue, [field]: !(currentValue as Record<string, unknown>)[field] };
      await updateSetting(key, newValue as Json);
    }
  };

  const handleUpdateValue = async (key: string, currentValue: Json, field: string, newFieldValue: unknown) => {
    if (typeof currentValue === 'object' && currentValue !== null && !Array.isArray(currentValue)) {
      const newValue = { ...currentValue, [field]: newFieldValue };
      await updateSetting(key, newValue as Json);
    }
  };

  const handleEmergencyShutdown = async () => {
    await updateSetting('emergency_shutdown', { enabled: true, reason: shutdownReason } as Json);
    setShutdownDialogOpen(false);
    setShutdownReason('');
  };

  const handleDisableShutdown = async () => {
    await updateSetting('emergency_shutdown', { enabled: false, reason: '' } as Json);
  };

  if (!isSuperAdmin) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{isRTL ? 'غير مصرح' : 'Unauthorized'}</AlertTitle>
            <AlertDescription>
              {isRTL 
                ? 'ليس لديك صلاحية للوصول إلى هذه الصفحة.'
                : 'You do not have permission to access this page.'}
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header - Premium Super Admin styling */}
        <div className="flex items-center gap-4">
          <div className="relative p-3 md:p-4 rounded-2xl bg-gradient-to-br from-red-500 via-rose-500 to-pink-500 text-white shadow-xl shadow-red-500/25">
            <Settings className="h-6 w-6 md:h-7 md:w-7" />
            <div className="absolute inset-0 rounded-2xl bg-red-500 blur-xl opacity-40 -z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="text-[10px] h-5 px-2 font-bold border-0 text-white bg-gradient-to-r from-red-500 to-rose-500">
                <Zap className="h-2.5 w-2.5 mr-1" />
                Super Admin
              </Badge>
              <Badge variant="outline" className="text-amber-600 border-amber-500/50">
                <AlertTriangle className="h-2.5 w-2.5 me-1" />
                {isRTL ? 'تحكم خطير' : 'Critical Controls'}
              </Badge>
            </div>
            <h1 className={cn('text-xl md:text-2xl font-bold', isRTL && 'font-arabic')}>
              {isRTL ? 'إعدادات النظام' : 'System Settings'}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isRTL ? 'تحكم المشرف الرئيسي في ميزات النظام' : 'Super Admin system controls'}
            </p>
          </div>
        </div>

        {/* System Health Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Server className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{isRTL ? 'الخادم' : 'Server'}</p>
                <Badge className="bg-emerald-500">{isRTL ? 'يعمل' : 'Online'}</Badge>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Database className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{isRTL ? 'قاعدة البيانات' : 'Database'}</p>
                <Badge className="bg-blue-500">{isRTL ? 'متصل' : 'Connected'}</Badge>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Zap className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{isRTL ? 'الاستجابة' : 'Response'}</p>
                <p className="text-sm font-bold">145ms</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <RingChart value={24} size={40} strokeWidth={5} showValue={false} />
              <div>
                <p className="text-xs text-muted-foreground">{isRTL ? 'التخزين' : 'Storage'}</p>
                <p className="text-sm font-bold">2.4/10 GB</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Emergency Shutdown Alert */}
        {emergencyShutdown?.enabled && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{isRTL ? 'إيقاف طوارئ فعال' : 'Emergency Shutdown Active'}</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>{emergencyShutdown.reason}</span>
              <Button size="sm" variant="outline" onClick={handleDisableShutdown}>
                {isRTL ? 'إلغاء الإيقاف' : 'Disable Shutdown'}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Maintenance Mode Alert */}
        {maintenanceMode?.enabled && (
          <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
            <Settings className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800 dark:text-amber-200">
              {isRTL ? 'وضع الصيانة فعال' : 'Maintenance Mode Active'}
            </AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-300">
              {maintenanceMode.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Emergency Shutdown */}
          <GlassCard variant="light" className="border-destructive/30">
            <GlassCardHeader>
              <div className="flex items-center gap-2 text-destructive">
                <Power className="h-5 w-5" />
                <h3 className="font-semibold">{isRTL ? 'إيقاف الطوارئ' : 'Emergency Shutdown'}</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {isRTL 
                  ? 'إيقاف كامل للتطبيق في حالات الاحتيال أو انتهاك الشروط'
                  : 'Complete app shutdown for fraud or terms violations'}
              </p>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="flex items-center justify-between">
                <Badge variant={emergencyShutdown?.enabled ? 'destructive' : 'outline'}>
                  {emergencyShutdown?.enabled 
                    ? (isRTL ? 'فعال' : 'Active')
                    : (isRTL ? 'غير فعال' : 'Inactive')
                  }
                </Badge>
                {!emergencyShutdown?.enabled ? (
                  <Button variant="destructive" onClick={() => setShutdownDialogOpen(true)}>
                    <Power className="h-4 w-4 me-2" />
                    {isRTL ? 'تفعيل الإيقاف' : 'Activate Shutdown'}
                  </Button>
                ) : (
                  <Button variant="outline" onClick={handleDisableShutdown}>
                    <RefreshCw className="h-4 w-4 me-2" />
                    {isRTL ? 'إعادة التشغيل' : 'Restart'}
                  </Button>
                )}
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Maintenance Mode */}
          <GlassCard>
            <GlassCardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                <h3 className="font-semibold">{isRTL ? 'وضع الصيانة' : 'Maintenance Mode'}</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {isRTL ? 'تعليق الوصول مؤقتًا للصيانة' : 'Temporarily suspend access for maintenance'}
              </p>
            </GlassCardHeader>
            <GlassCardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>{isRTL ? 'تفعيل وضع الصيانة' : 'Enable Maintenance'}</Label>
                <Switch
                  checked={maintenanceMode?.enabled || false}
                  onCheckedChange={() => handleToggle('maintenance_mode', maintenanceMode as Json, 'enabled')}
                />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? 'رسالة الصيانة' : 'Maintenance Message'}</Label>
                <Textarea
                  value={maintenanceMode?.message || ''}
                  onChange={(e) => handleUpdateValue('maintenance_mode', maintenanceMode as Json, 'message', e.target.value)}
                  placeholder={isRTL ? 'أدخل رسالة الصيانة...' : 'Enter maintenance message...'}
                />
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Registration Controls */}
          <GlassCard>
            <GlassCardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <h3 className="font-semibold">{isRTL ? 'التسجيل' : 'Registration'}</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {isRTL ? 'التحكم في تسجيل المستخدمين الجدد' : 'Control new user registration'}
              </p>
            </GlassCardHeader>
            <GlassCardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <Label>{isRTL ? 'تسجيل المسافرين' : 'Traveler Registration'}</Label>
                <Switch
                  checked={registrationEnabled?.travelers || false}
                  onCheckedChange={() => handleToggle('registration_enabled', registrationEnabled as Json, 'travelers')}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <Label>{isRTL ? 'تسجيل مقدمي الخدمات' : 'Provider Registration'}</Label>
                <Switch
                  checked={registrationEnabled?.providers || false}
                  onCheckedChange={() => handleToggle('registration_enabled', registrationEnabled as Json, 'providers')}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <Label>{isRTL ? 'تسجيل الوكلاء' : 'Vendor Registration'}</Label>
                <Switch
                  checked={registrationEnabled?.vendors || false}
                  onCheckedChange={() => handleToggle('registration_enabled', registrationEnabled as Json, 'vendors')}
                />
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Booking Controls */}
          <GlassCard>
            <GlassCardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <h3 className="font-semibold">{isRTL ? 'الحجوزات' : 'Bookings'}</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {isRTL ? 'التحكم في نظام الحجز' : 'Control the booking system'}
              </p>
            </GlassCardHeader>
            <GlassCardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <Label>{isRTL ? 'تفعيل الحجوزات' : 'Enable Bookings'}</Label>
                <Switch
                  checked={bookingEnabled?.enabled || false}
                  onCheckedChange={() => handleToggle('booking_enabled', bookingEnabled as Json, 'enabled')}
                />
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Donations Controls */}
          <GlassCard>
            <GlassCardHeader>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                <h3 className="font-semibold">{isRTL ? 'التبرعات' : 'Donations'}</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {isRTL ? 'التحكم في نظام التبرعات' : 'Control the donation system'}
              </p>
            </GlassCardHeader>
            <GlassCardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <Label>{isRTL ? 'تفعيل التبرعات' : 'Enable Donations'}</Label>
                <Switch
                  checked={donationsEnabled?.enabled || false}
                  onCheckedChange={() => handleToggle('donations_enabled', donationsEnabled as Json, 'enabled')}
                />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? 'الحد الأدنى للتبرع (SAR)' : 'Minimum Donation (SAR)'}</Label>
                <Input
                  type="number"
                  value={donationsEnabled?.minimum_amount || 10}
                  onChange={(e) => handleUpdateValue('donations_enabled', donationsEnabled as Json, 'minimum_amount', parseInt(e.target.value))}
                />
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Platform Fees */}
          <GlassCard>
            <GlassCardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                <h3 className="font-semibold">{isRTL ? 'عمولات المنصة' : 'Platform Fees'}</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {isRTL ? 'نسب العمولة للمنصة' : 'Platform commission percentages'}
              </p>
            </GlassCardHeader>
            <GlassCardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{isRTL ? 'عمولة مقدمي الخدمات (%)' : 'Provider Fee (%)'}</Label>
                <Input
                  type="number"
                  value={platformFees?.provider_percentage || 10}
                  onChange={(e) => handleUpdateValue('platform_fees', platformFees as Json, 'provider_percentage', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? 'عمولة الوكلاء (%)' : 'Vendor Fee (%)'}</Label>
                <Input
                  type="number"
                  value={platformFees?.vendor_percentage || 15}
                  onChange={(e) => handleUpdateValue('platform_fees', platformFees as Json, 'vendor_percentage', parseInt(e.target.value))}
                />
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>

        {/* Emergency Shutdown Dialog */}
        <Dialog open={shutdownDialogOpen} onOpenChange={setShutdownDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                {isRTL ? 'تأكيد إيقاف الطوارئ' : 'Confirm Emergency Shutdown'}
              </DialogTitle>
              <DialogDescription>
                {isRTL 
                  ? 'هذا سيوقف التطبيق بالكامل لجميع المستخدمين. هل أنت متأكد؟'
                  : 'This will shut down the entire application for all users. Are you sure?'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{isRTL ? 'سبب الإيقاف' : 'Shutdown Reason'}</Label>
                <Textarea
                  value={shutdownReason}
                  onChange={(e) => setShutdownReason(e.target.value)}
                  placeholder={isRTL ? 'أدخل سبب الإيقاف...' : 'Enter shutdown reason...'}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShutdownDialogOpen(false)}>
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button variant="destructive" onClick={handleEmergencyShutdown} disabled={!shutdownReason}>
                <Power className="h-4 w-4 me-2" />
                {isRTL ? 'تأكيد الإيقاف' : 'Confirm Shutdown'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
