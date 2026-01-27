import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { LanguageToggle } from '@/components/LanguageToggle';

type RoleType = 'traveler' | 'provider';

export default function SignupPage() {
  const { t, isRTL } = useLanguage();
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<'role' | 'details'>('role');
  const [selectedRole, setSelectedRole] = useState<RoleType>('traveler');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  const handleRoleSelect = (role: RoleType) => {
    setSelectedRole(role);
    setStep('details');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !fullName) {
      toast({
        title: t.common.error,
        description: t.auth.emailRequired,
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: t.common.error,
        description: t.auth.passwordTooShort,
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: t.common.error,
        description: t.auth.passwordMismatch,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    const { error } = await signUp(email, password, fullName, selectedRole);

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

    navigate(selectedRole === 'provider' ? '/provider' : '/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background pattern-islamic">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className={`text-lg font-bold ${isRTL ? 'font-arabic' : ''}`}>و</span>
          </div>
          <span className={`text-xl font-semibold ${isRTL ? 'font-arabic' : ''}`}>{t.brand}</span>
        </Link>
        <LanguageToggle />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          {step === 'role' ? (
            <>
              <CardHeader className="text-center">
                <CardTitle className={`text-2xl ${isRTL ? 'font-arabic' : ''}`}>
                  {t.auth.signupAs}
                </CardTitle>
                <CardDescription>{t.auth.noAccount}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Traveler Option */}
                <button
                  onClick={() => handleRoleSelect('traveler')}
                  className="w-full p-4 border border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-start group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{t.auth.traveler}</h3>
                      <p className="text-sm text-muted-foreground">{t.auth.travelerDesc}</p>
                    </div>
                  </div>
                </button>

                {/* Provider Option */}
                <button
                  onClick={() => handleRoleSelect('provider')}
                  className="w-full p-4 border border-border rounded-xl hover:border-secondary hover:bg-secondary/5 transition-all text-start group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors">
                      <svg
                        className="h-6 w-6"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold">{t.auth.provider}</h3>
                      <p className="text-sm text-muted-foreground">{t.auth.providerDesc}</p>
                    </div>
                  </div>
                </button>
              </CardContent>
              <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                  {t.auth.hasAccount}{' '}
                  <Link to="/login" className="text-primary font-medium hover:underline">
                    {t.auth.login}
                  </Link>
                </p>
              </CardFooter>
            </>
          ) : (
            <>
              <CardHeader>
                <button
                  onClick={() => setStep('role')}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
                >
                  <BackArrow className="h-4 w-4" />
                  {t.common.back}
                </button>
                <CardTitle className={`text-2xl ${isRTL ? 'font-arabic' : ''}`}>
                  {t.auth.signup}
                </CardTitle>
                <CardDescription>
                  {selectedRole === 'traveler' ? t.auth.travelerDesc : t.auth.providerDesc}
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName">{t.auth.fullName}</Label>
                    <div className="relative">
                      <User className={`absolute top-3 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder={t.auth.fullName}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={isRTL ? 'pr-10' : 'pl-10'}
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">{t.auth.email}</Label>
                    <div className="relative">
                      <Mail className={`absolute top-3 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={isRTL ? 'pr-10' : 'pl-10'}
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password">{t.auth.password}</Label>
                    <div className="relative">
                      <Lock className={`absolute top-3 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={isRTL ? 'pr-10 pl-10' : 'pl-10 pr-10'}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute top-3 text-muted-foreground hover:text-foreground ${isRTL ? 'left-3' : 'right-3'}`}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t.auth.confirmPassword}</Label>
                    <div className="relative">
                      <Lock className={`absolute top-3 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={isRTL ? 'pr-10' : 'pl-10'}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? t.common.loading : t.auth.signup}
                  </Button>
                  <p className="text-sm text-muted-foreground text-center">
                    {t.auth.hasAccount}{' '}
                    <Link to="/login" className="text-primary font-medium hover:underline">
                      {t.auth.login}
                    </Link>
                  </p>
                </CardFooter>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
