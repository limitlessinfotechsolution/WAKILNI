import { useState } from 'react';
import { 
  Settings, Power, AlertTriangle, Users, Calendar, Heart, 
  Shield, Check, X, RefreshCw
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { useLanguage } from '@/lib/i18n';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
      <MainLayout>
        <div className="container py-8 px-4">
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
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8 px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className={`text-2xl font-bold flex items-center gap-2 ${isRTL ? 'font-arabic' : ''}`}>
            <Shield className="h-6 w-6 text-destructive" />
            {isRTL ? 'إعدادات النظام' : 'System Settings'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isRTL ? 'تحكم المشرف الرئيسي في ميزات النظام' : 'Super Admin system controls'}
          </p>
        </div>

        {/* Emergency Shutdown Alert */}
        {emergencyShutdown?.enabled && (
          <Alert variant="destructive" className="mb-6">
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
          <Alert className="mb-6 border-yellow-500 bg-yellow-50">
            <Settings className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800">
              {isRTL ? 'وضع الصيانة فعال' : 'Maintenance Mode Active'}
            </AlertTitle>
            <AlertDescription className="text-yellow-700">
              {maintenanceMode.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Emergency Shutdown */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Power className="h-5 w-5" />
                {isRTL ? 'إيقاف الطوارئ' : 'Emergency Shutdown'}
              </CardTitle>
              <CardDescription>
                {isRTL 
                  ? 'إيقاف كامل للتطبيق في حالات الاحتيال أو انتهاك الشروط'
                  : 'Complete app shutdown for fraud or terms violations'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant={emergencyShutdown?.enabled ? 'destructive' : 'outline'}>
                    {emergencyShutdown?.enabled 
                      ? (isRTL ? 'فعال' : 'Active')
                      : (isRTL ? 'غير فعال' : 'Inactive')
                    }
                  </Badge>
                </div>
                {!emergencyShutdown?.enabled ? (
                  <Button variant="destructive" onClick={() => setShutdownDialogOpen(true)}>
                    <Power className="h-4 w-4 mr-2" />
                    {isRTL ? 'تفعيل الإيقاف' : 'Activate Shutdown'}
                  </Button>
                ) : (
                  <Button variant="outline" onClick={handleDisableShutdown}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {isRTL ? 'إعادة التشغيل' : 'Restart'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Mode */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {isRTL ? 'وضع الصيانة' : 'Maintenance Mode'}
              </CardTitle>
              <CardDescription>
                {isRTL ? 'تعليق الوصول مؤقتًا للصيانة' : 'Temporarily suspend access for maintenance'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          {/* Registration Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {isRTL ? 'التسجيل' : 'Registration'}
              </CardTitle>
              <CardDescription>
                {isRTL ? 'التحكم في تسجيل المستخدمين الجدد' : 'Control new user registration'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>{isRTL ? 'تسجيل المسافرين' : 'Traveler Registration'}</Label>
                <Switch
                  checked={registrationEnabled?.travelers || false}
                  onCheckedChange={() => handleToggle('registration_enabled', registrationEnabled as Json, 'travelers')}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>{isRTL ? 'تسجيل مقدمي الخدمات' : 'Provider Registration'}</Label>
                <Switch
                  checked={registrationEnabled?.providers || false}
                  onCheckedChange={() => handleToggle('registration_enabled', registrationEnabled as Json, 'providers')}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>{isRTL ? 'تسجيل الوكلاء' : 'Vendor Registration'}</Label>
                <Switch
                  checked={registrationEnabled?.vendors || false}
                  onCheckedChange={() => handleToggle('registration_enabled', registrationEnabled as Json, 'vendors')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Booking Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {isRTL ? 'الحجوزات' : 'Bookings'}
              </CardTitle>
              <CardDescription>
                {isRTL ? 'التحكم في نظام الحجز' : 'Control the booking system'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>{isRTL ? 'تفعيل الحجوزات' : 'Enable Bookings'}</Label>
                <Switch
                  checked={bookingEnabled?.enabled || false}
                  onCheckedChange={() => handleToggle('booking_enabled', bookingEnabled as Json, 'enabled')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Donations Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                {isRTL ? 'التبرعات' : 'Donations'}
              </CardTitle>
              <CardDescription>
                {isRTL ? 'التحكم في نظام التبرعات' : 'Control the donation system'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
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
            </CardContent>
          </Card>

          {/* Platform Fees */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {isRTL ? 'عمولات المنصة' : 'Platform Fees'}
              </CardTitle>
              <CardDescription>
                {isRTL ? 'نسب العمولة للمنصة' : 'Platform commission percentages'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>
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
                <Power className="h-4 w-4 mr-2" />
                {isRTL ? 'تأكيد الإيقاف' : 'Confirm Shutdown'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
