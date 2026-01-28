import { useState } from 'react';
import { UserPlus, Mail, Lock, User, Phone, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { useCreateUser } from '@/hooks/useCreateUser';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface CreateUserDialogProps {
  onUserCreated?: () => void;
}

export function CreateUserDialog({ onUserCreated }: CreateUserDialogProps) {
  const { isRTL } = useLanguage();
  const { isSuperAdmin, isAdmin } = useAuth();
  const { createUser, isLoading } = useCreateUser();
  const [open, setOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    fullNameAr: '',
    phone: '',
    role: 'traveler' as AppRole,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Determine available roles based on current user's role
  const getAvailableRoles = (): { value: AppRole; label: string; labelAr: string }[] => {
    const baseRoles = [
      { value: 'traveler' as AppRole, label: 'Traveler', labelAr: 'مسافر' },
      { value: 'provider' as AppRole, label: 'Provider', labelAr: 'مقدم خدمة' },
      { value: 'vendor' as AppRole, label: 'Vendor', labelAr: 'وكيل' },
    ];

    if (isSuperAdmin) {
      return [
        ...baseRoles,
        { value: 'admin' as AppRole, label: 'Admin', labelAr: 'مشرف' },
        { value: 'super_admin' as AppRole, label: 'Super Admin', labelAr: 'مشرف رئيسي' },
      ];
    }

    return baseRoles;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = isRTL ? 'البريد الإلكتروني مطلوب' : 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = isRTL ? 'البريد الإلكتروني غير صالح' : 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = isRTL ? 'كلمة المرور مطلوبة' : 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = isRTL ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = isRTL ? 'كلمات المرور غير متطابقة' : 'Passwords do not match';
    }

    if (!formData.fullName) {
      newErrors.fullName = isRTL ? 'الاسم مطلوب' : 'Name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const success = await createUser({
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      fullNameAr: formData.fullNameAr || undefined,
      phone: formData.phone || undefined,
      role: formData.role,
    });

    if (success) {
      setOpen(false);
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        fullNameAr: '',
        phone: '',
        role: 'traveler',
      });
      setErrors({});
      onUserCreated?.();
    }
  };

  const availableRoles = getAvailableRoles();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          {isRTL ? 'إنشاء مستخدم' : 'Create User'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            {isRTL ? 'إنشاء مستخدم جديد' : 'Create New User'}
          </DialogTitle>
          <DialogDescription>
            {isSuperAdmin 
              ? (isRTL ? 'يمكنك إنشاء أي نوع من المستخدمين بما في ذلك المشرفين' : 'You can create any type of user including admins')
              : (isRTL ? 'يمكنك إنشاء مستخدمين بأدوار محددة' : 'You can create users with specific roles')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Email */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {isRTL ? 'البريد الإلكتروني' : 'Email'}
            </Label>
            <Input
              type="email"
              placeholder={isRTL ? 'user@example.com' : 'user@example.com'}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          {/* Full Name */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {isRTL ? 'الاسم (English)' : 'Full Name'}
              </Label>
              <Input
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className={errors.fullName ? 'border-destructive' : ''}
              />
              {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                {isRTL ? 'الاسم بالعربي' : 'Arabic Name'}
              </Label>
              <Input
                placeholder="محمد أحمد"
                value={formData.fullNameAr}
                onChange={(e) => setFormData({ ...formData, fullNameAr: e.target.value })}
                dir="rtl"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              {isRTL ? 'رقم الهاتف' : 'Phone Number'}
            </Label>
            <Input
              type="tel"
              placeholder="+966 5X XXX XXXX"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          {/* Password */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                {isRTL ? 'كلمة المرور' : 'Password'}
              </Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={errors.password ? 'border-destructive' : ''}
              />
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>
            <div className="space-y-2">
              <Label>{isRTL ? 'تأكيد كلمة المرور' : 'Confirm'}</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={errors.confirmPassword ? 'border-destructive' : ''}
              />
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label>{isRTL ? 'الدور' : 'Role'}</Label>
            <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v as AppRole })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {isRTL ? role.labelAr : role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {isRTL ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading 
              ? (isRTL ? 'جاري الإنشاء...' : 'Creating...') 
              : (isRTL ? 'إنشاء المستخدم' : 'Create User')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
