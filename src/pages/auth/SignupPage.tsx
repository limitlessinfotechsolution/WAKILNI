import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Eye, EyeOff, Mail, Lock, User, ArrowLeft, ArrowRight, 
  Phone, MapPin, Building2, CheckCircle2, FileText, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { GlassCard } from '@/components/cards';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';
import wakilniLogo from '@/assets/wakilni-logo.jpg';

type RoleType = 'traveler' | 'provider' | 'vendor';
type StepType = 'role' | 'account' | 'profile' | 'complete';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  fullNameAr: string;
  phone: string;
  companyName: string;
  companyNameAr: string;
  bio: string;
  bioAr: string;
  commercialReg: string;
  taxNumber: string;
  address: string;
  addressAr: string;
}

const ROLE_STEPS: Record<RoleType, StepType[]> = {
  traveler: ['role', 'account', 'complete'],
  provider: ['role', 'account', 'profile', 'complete'],
  vendor: ['role', 'account', 'profile', 'complete'],
};

const roleConfig = {
  traveler: {
    icon: '🧳',
    gradient: 'from-emerald-500 to-teal-500',
    bgGradient: 'from-emerald-500/20 to-teal-500/20',
    benefits: ['Book services', 'Track bookings', 'Receive proofs'],
    benefitsAr: ['حجز خدمات', 'تتبع الحجوزات', 'استلام الإثباتات'],
  },
  provider: {
    icon: '🕋',
    gradient: 'from-amber-500 to-orange-500',
    bgGradient: 'from-amber-500/20 to-orange-500/20',
    benefits: ['Offer services', 'Earn income', 'Build reputation'],
    benefitsAr: ['تقديم خدمات', 'كسب الأرباح', 'بناء السمعة'],
  },
  vendor: {
    icon: '🏢',
    gradient: 'from-blue-500 to-indigo-500',
    bgGradient: 'from-blue-500/20 to-indigo-500/20',
    benefits: ['Manage team', 'Scale operations', 'Analytics'],
    benefitsAr: ['إدارة فريق', 'توسيع العمليات', 'التحليلات'],
  },
};

export default function SignupPage() {
  const { t, isRTL } = useLanguage();
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<StepType>('role');
  const [selectedRole, setSelectedRole] = useState<RoleType>('traveler');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    fullNameAr: '',
    phone: '',
    companyName: '',
    companyNameAr: '',
    bio: '',
    bioAr: '',
    commercialReg: '',
    taxNumber: '',
    address: '',
    addressAr: '',
  });

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;
  const ForwardArrow = isRTL ? ArrowLeft : ArrowRight;

  const steps = ROLE_STEPS[selectedRole];
  const currentStepIndex = steps.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const updateForm = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRoleSelect = (role: RoleType) => {
    setSelectedRole(role);
    setCurrentStep('account');
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  const handleNext = () => {
    if (currentStep === 'account') {
      if (!formData.email || !formData.password || !formData.fullName) {
        toast({
          title: t.common.error,
          description: t.auth.emailRequired,
          variant: 'destructive',
        });
        return;
      }
      if (formData.password.length < 8) {
        toast({
          title: t.common.error,
          description: t.auth.passwordTooShort,
          variant: 'destructive',
        });
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: t.common.error,
          description: t.auth.passwordMismatch,
          variant: 'destructive',
        });
        return;
      }
    }

    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    const { error } = await signUp(formData.email, formData.password, formData.fullName, selectedRole);

    if (error) {
      toast({
        title: t.common.error,
        description: error.message,
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    toast({
      title: t.common.success,
      description: t.auth.signupSuccess,
    });

    setCurrentStep('complete');
    setIsLoading(false);

    setTimeout(() => {
      navigate(selectedRole === 'provider' ? '/provider' : selectedRole === 'vendor' ? '/vendor' : '/dashboard');
    }, 2000);
  };

  const getStepLabel = (step: StepType): string => {
    const labels: Record<StepType, { en: string; ar: string }> = {
      role: { en: 'Select Role', ar: 'اختر الدور' },
      account: { en: 'Account', ar: 'الحساب' },
      profile: { en: 'Profile', ar: 'الملف الشخصي' },
      complete: { en: 'Complete', ar: 'مكتمل' },
    };
    return isRTL ? labels[step].ar : labels[step].en;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/15 rounded-full blur-[80px] animate-pulse delay-1000" />
        <div className="absolute inset-0 pattern-islamic opacity-30" />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between p-4 md:p-6 relative z-10">
        <Link to="/" className="flex items-center gap-3 group">
          <div className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden',
            'shadow-lg shadow-primary/30 group-hover:shadow-xl group-hover:shadow-primary/40',
            'transition-all duration-300 group-hover:scale-105'
          )}>
            <img src={wakilniLogo} alt="Wakilni" className="h-full w-full object-cover" />
          </div>
          <span className={cn(
            'text-xl font-semibold gradient-text-sacred',
            isRTL && 'font-arabic'
          )}>
            {t.brand}
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-lg animate-fade-in">
          {/* Progress Indicator - Outside Card */}
          {currentStep !== 'role' && currentStep !== 'complete' && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                {steps.map((step, index) => (
                  <div key={step} className="flex items-center flex-1">
                    <div className="relative flex flex-col items-center">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold',
                          'transition-all duration-300',
                          index < currentStepIndex
                            ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30'
                            : index === currentStepIndex
                            ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-primary/20'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {index < currentStepIndex ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span className={cn(
                        'absolute -bottom-6 text-xs whitespace-nowrap',
                        index <= currentStepIndex ? 'text-primary font-medium' : 'text-muted-foreground'
                      )}>
                        {getStepLabel(step)}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={cn(
                          'flex-1 h-1 mx-2 rounded-full transition-colors duration-300',
                          index < currentStepIndex ? 'bg-primary' : 'bg-muted'
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Card */}
          <div className="relative p-px rounded-3xl bg-gradient-to-br from-primary/50 via-transparent to-secondary/50 mt-8">
            <GlassCard className="rounded-[23px] p-6 md:p-8">
              {/* Step: Role Selection */}
              {currentStep === 'role' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 text-primary mb-4">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <h1 className={cn('text-2xl md:text-3xl font-bold mb-2', isRTL && 'font-arabic')}>
                      {t.auth.signupAs}
                    </h1>
                    <p className="text-muted-foreground">
                      {isRTL ? 'اختر نوع حسابك' : 'Choose your account type'}
                    </p>
                  </div>

                  {/* Role Cards */}
                  <div className="space-y-4">
                    {(Object.keys(roleConfig) as RoleType[]).map((role) => {
                      const config = roleConfig[role];
                      return (
                        <button
                          key={role}
                          onClick={() => handleRoleSelect(role)}
                          className={cn(
                            'w-full p-5 rounded-2xl border-2 text-start',
                            'transition-all duration-300 group',
                            'hover:scale-[1.02] active:scale-[0.98]',
                            'border-border/50 hover:border-primary/50',
                            'hover:shadow-lg hover:shadow-primary/10'
                          )}
                        >
                          <div className="flex items-start gap-4">
                            <div className={cn(
                              'w-14 h-14 rounded-2xl flex items-center justify-center text-2xl',
                              'bg-gradient-to-br transition-all duration-300',
                              config.bgGradient,
                              'group-hover:scale-110'
                            )}>
                              {config.icon}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-1">
                                {role === 'traveler' ? t.auth.traveler : 
                                 role === 'provider' ? t.auth.provider : 
                                 (isRTL ? 'شركة خدمات' : 'Service Vendor')}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-3">
                                {role === 'traveler' ? t.auth.travelerDesc : 
                                 role === 'provider' ? t.auth.providerDesc : 
                                 (isRTL ? 'إدارة وكالة السفر ومقدمي الخدمات' : 'Manage your travel agency and providers')}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {(isRTL ? config.benefitsAr : config.benefits).map((benefit, i) => (
                                  <span 
                                    key={i}
                                    className={cn(
                                      'text-xs px-2.5 py-1 rounded-full',
                                      'bg-muted text-muted-foreground'
                                    )}
                                  >
                                    {benefit}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <ForwardArrow className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <p className="text-center text-sm text-muted-foreground">
                    {t.auth.hasAccount}{' '}
                    <Link to="/login" className="text-primary font-medium hover:underline">
                      {t.auth.login}
                    </Link>
                  </p>
                </div>
              )}

              {/* Step: Account Details */}
              {currentStep === 'account' && (
                <div className="space-y-5">
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <BackArrow className="h-4 w-4" />
                    {t.common.back}
                  </button>
                  
                  <div>
                    <h2 className={cn('text-xl font-bold mb-1', isRTL && 'font-arabic')}>
                      {isRTL ? 'معلومات الحساب' : 'Account Information'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'أدخل بياناتك الأساسية' : 'Enter your basic information'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{isRTL ? 'الاسم الكامل (إنجليزي)' : 'Full Name (English)'}</Label>
                      <div className="relative">
                        <User className={cn(
                          'absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground',
                          isRTL ? 'right-4' : 'left-4'
                        )} />
                        <Input
                          value={formData.fullName}
                          onChange={(e) => updateForm('fullName', e.target.value)}
                          className={cn('h-11 rounded-xl', isRTL ? 'pr-11' : 'pl-11')}
                          placeholder="John Doe"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{isRTL ? 'الاسم الكامل (عربي)' : 'Full Name (Arabic)'}</Label>
                      <Input
                        value={formData.fullNameAr}
                        onChange={(e) => updateForm('fullNameAr', e.target.value)}
                        className="h-11 rounded-xl"
                        placeholder="الاسم الكامل"
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t.auth.email}</Label>
                    <div className="relative">
                      <Mail className={cn(
                        'absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground',
                        isRTL ? 'right-4' : 'left-4'
                      )} />
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateForm('email', e.target.value)}
                        className={cn('h-11 rounded-xl', isRTL ? 'pr-11' : 'pl-11')}
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{isRTL ? 'رقم الهاتف' : 'Phone Number'}</Label>
                    <div className="relative">
                      <Phone className={cn(
                        'absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground',
                        isRTL ? 'right-4' : 'left-4'
                      )} />
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateForm('phone', e.target.value)}
                        className={cn('h-11 rounded-xl', isRTL ? 'pr-11' : 'pl-11')}
                        placeholder="+966 5XX XXX XXXX"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t.auth.password}</Label>
                    <div className="relative">
                      <Lock className={cn(
                        'absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground',
                        isRTL ? 'right-4' : 'left-4'
                      )} />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => updateForm('password', e.target.value)}
                        className={cn('h-11 rounded-xl', isRTL ? 'pr-11 pl-11' : 'pl-11 pr-11')}
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={cn(
                          'absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground',
                          isRTL ? 'left-4' : 'right-4'
                        )}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {isRTL ? 'يجب أن تكون 8 أحرف على الأقل' : 'Must be at least 8 characters'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>{t.auth.confirmPassword}</Label>
                    <div className="relative">
                      <Lock className={cn(
                        'absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground',
                        isRTL ? 'right-4' : 'left-4'
                      )} />
                      <Input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => updateForm('confirmPassword', e.target.value)}
                        className={cn('h-11 rounded-xl', isRTL ? 'pr-11' : 'pl-11')}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={selectedRole === 'traveler' ? handleSubmit : handleNext} 
                    className={cn(
                      'w-full h-12 rounded-xl font-medium',
                      'bg-gradient-to-r from-primary to-primary/90',
                      'shadow-lg shadow-primary/30 hover:shadow-xl',
                      'transition-all duration-300'
                    )} 
                    disabled={isLoading}
                  >
                    {isLoading ? t.common.loading : selectedRole === 'traveler' ? t.auth.signup : (isRTL ? 'التالي' : 'Next')}
                    {!isLoading && selectedRole !== 'traveler' && <ForwardArrow className="h-4 w-4 ms-2" />}
                  </Button>
                </div>
              )}

              {/* Step: Profile (Provider) */}
              {currentStep === 'profile' && selectedRole === 'provider' && (
                <div className="space-y-5">
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <BackArrow className="h-4 w-4" />
                    {t.common.back}
                  </button>
                  
                  <div>
                    <h2 className={cn('text-xl font-bold mb-1', isRTL && 'font-arabic')}>
                      {isRTL ? 'معلومات المزود' : 'Provider Information'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'أخبرنا المزيد عنك' : 'Tell us more about yourself'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{isRTL ? 'اسم الشركة (إنجليزي)' : 'Company Name (English)'}</Label>
                      <Input
                        value={formData.companyName}
                        onChange={(e) => updateForm('companyName', e.target.value)}
                        className="h-11 rounded-xl"
                        placeholder="My Company"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{isRTL ? 'اسم الشركة (عربي)' : 'Company Name (Arabic)'}</Label>
                      <Input
                        value={formData.companyNameAr}
                        onChange={(e) => updateForm('companyNameAr', e.target.value)}
                        className="h-11 rounded-xl"
                        placeholder="اسم الشركة"
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{isRTL ? 'نبذة عنك (إنجليزي)' : 'Bio (English)'}</Label>
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => updateForm('bio', e.target.value)}
                      className="rounded-xl resize-none"
                      placeholder="Tell travelers about your experience..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{isRTL ? 'نبذة عنك (عربي)' : 'Bio (Arabic)'}</Label>
                    <Textarea
                      value={formData.bioAr}
                      onChange={(e) => updateForm('bioAr', e.target.value)}
                      className="rounded-xl resize-none"
                      placeholder="أخبر المسافرين عن خبرتك..."
                      rows={3}
                      dir="rtl"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                    <p className="text-sm text-muted-foreground flex items-start gap-2">
                      <FileText className="h-4 w-4 mt-0.5 shrink-0" />
                      {isRTL 
                        ? 'سيُطلب منك إكمال التحقق (KYC) لاحقاً لبدء تقديم الخدمات'
                        : 'You will be asked to complete verification (KYC) later to start offering services'}
                    </p>
                  </div>

                  <Button 
                    onClick={handleSubmit} 
                    className={cn(
                      'w-full h-12 rounded-xl font-medium',
                      'bg-gradient-to-r from-primary to-primary/90',
                      'shadow-lg shadow-primary/30 hover:shadow-xl',
                      'transition-all duration-300'
                    )} 
                    disabled={isLoading}
                  >
                    {isLoading ? t.common.loading : t.auth.signup}
                  </Button>
                </div>
              )}

              {/* Step: Profile (Vendor) */}
              {currentStep === 'profile' && selectedRole === 'vendor' && (
                <div className="space-y-5">
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <BackArrow className="h-4 w-4" />
                    {t.common.back}
                  </button>
                  
                  <div>
                    <h2 className={cn('text-xl font-bold mb-1', isRTL && 'font-arabic')}>
                      {isRTL ? 'معلومات الشركة' : 'Company Information'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'بيانات شركتك الرسمية' : 'Your official company details'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{isRTL ? 'اسم الشركة (إنجليزي)' : 'Company Name (English)'}</Label>
                      <Input
                        value={formData.companyName}
                        onChange={(e) => updateForm('companyName', e.target.value)}
                        className="h-11 rounded-xl"
                        placeholder="Travel Agency LLC"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{isRTL ? 'اسم الشركة (عربي)' : 'Company Name (Arabic)'}</Label>
                      <Input
                        value={formData.companyNameAr}
                        onChange={(e) => updateForm('companyNameAr', e.target.value)}
                        className="h-11 rounded-xl"
                        placeholder="وكالة السفر"
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{isRTL ? 'رقم السجل التجاري' : 'Commercial Registration'}</Label>
                      <Input
                        value={formData.commercialReg}
                        onChange={(e) => updateForm('commercialReg', e.target.value)}
                        className="h-11 rounded-xl"
                        placeholder="1234567890"
                        maxLength={10}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{isRTL ? 'الرقم الضريبي' : 'Tax/VAT Number'}</Label>
                      <Input
                        value={formData.taxNumber}
                        onChange={(e) => updateForm('taxNumber', e.target.value)}
                        className="h-11 rounded-xl"
                        placeholder="300000000000003"
                        maxLength={15}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{isRTL ? 'العنوان (إنجليزي)' : 'Address (English)'}</Label>
                    <div className="relative">
                      <MapPin className={cn(
                        'absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground',
                        isRTL ? 'right-4' : 'left-4'
                      )} />
                      <Input
                        value={formData.address}
                        onChange={(e) => updateForm('address', e.target.value)}
                        className={cn('h-11 rounded-xl', isRTL ? 'pr-11' : 'pl-11')}
                        placeholder="123 Main St, Riyadh"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                    <p className="text-sm text-muted-foreground flex items-start gap-2">
                      <FileText className="h-4 w-4 mt-0.5 shrink-0" />
                      {isRTL 
                        ? 'سيُطلب منك إكمال التحقق (KYC) وإرفاق المستندات لاحقاً'
                        : 'You will be asked to complete verification (KYC) and upload documents later'}
                    </p>
                  </div>

                  <Button 
                    onClick={handleSubmit} 
                    className={cn(
                      'w-full h-12 rounded-xl font-medium',
                      'bg-gradient-to-r from-primary to-primary/90',
                      'shadow-lg shadow-primary/30 hover:shadow-xl',
                      'transition-all duration-300'
                    )} 
                    disabled={isLoading}
                  >
                    {isLoading ? t.common.loading : t.auth.signup}
                  </Button>
                </div>
              )}

              {/* Step: Complete */}
              {currentStep === 'complete' && (
                <div className="text-center py-8">
                  <div className={cn(
                    'w-20 h-20 rounded-full mx-auto mb-6',
                    'bg-gradient-to-br from-green-500 to-emerald-500',
                    'flex items-center justify-center',
                    'shadow-xl shadow-green-500/30',
                    'animate-scale-in'
                  )}>
                    <CheckCircle2 className="h-10 w-10 text-white" />
                  </div>
                  <h2 className={cn('text-2xl font-bold mb-2', isRTL && 'font-arabic')}>
                    {isRTL ? '🎉 تهانينا!' : '🎉 Congratulations!'}
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    {isRTL ? 'تم إنشاء حسابك بنجاح' : 'Your account has been created successfully'}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {isRTL ? 'جاري توجيهك إلى لوحة التحكم...' : 'Redirecting you to your dashboard...'}
                  </p>
                  <div className="flex justify-center">
                    <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
                  </div>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
}
