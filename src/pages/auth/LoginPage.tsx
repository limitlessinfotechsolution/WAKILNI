import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Sparkles, Fingerprint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GlassCard } from '@/components/cards';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';
import wakilniLogo from '@/assets/wakilni-logo.jpg';

export default function LoginPage() {
  const { t, isRTL } = useLanguage();
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: t.common.error,
        description: t.auth.emailRequired,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: t.common.error,
        description: t.auth.invalidCredentials,
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    toast({
      title: t.common.success,
      description: t.auth.loginSuccess,
    });

    navigate('/dashboard');
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
        <div className="w-full max-w-md animate-fade-in">
          {/* Card with Gradient Border */}
          <div className="relative p-px rounded-3xl bg-gradient-to-br from-primary/50 via-transparent to-secondary/50">
            <GlassCard className="rounded-[23px] p-8">
              {/* Header */}
              <div className="text-center mb-8">
                {/* Animated Logo */}
                <div className={cn(
                  'inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 overflow-hidden',
                  'shadow-xl shadow-primary/30 animate-scale-in'
                )}>
                  <img src={wakilniLogo} alt="Wakilni" className="h-full w-full object-cover" />
                </div>
                
                <h1 className={cn(
                  'text-2xl md:text-3xl font-bold mb-2',
                  isRTL && 'font-arabic'
                )}>
                  {t.auth.login}
                </h1>
                <p className="text-muted-foreground">{t.common.welcome}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label 
                    htmlFor="email" 
                    className={cn(
                      'text-sm font-medium transition-colors duration-200',
                      focusedField === 'email' && 'text-primary'
                    )}
                  >
                    {t.auth.email}
                  </Label>
                  <div className="relative group">
                    <div className={cn(
                      'absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-secondary opacity-0 blur-sm',
                      'transition-opacity duration-300',
                      focusedField === 'email' && 'opacity-30'
                    )} />
                    <div className="relative">
                      <Mail className={cn(
                        'absolute top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200',
                        isRTL ? 'right-4' : 'left-4',
                        focusedField === 'email' ? 'text-primary' : 'text-muted-foreground'
                      )} />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        className={cn(
                          'h-12 rounded-xl border-2 transition-all duration-200',
                          isRTL ? 'pr-12' : 'pl-12',
                          focusedField === 'email' 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border/50 hover:border-border'
                        )}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label 
                      htmlFor="password"
                      className={cn(
                        'text-sm font-medium transition-colors duration-200',
                        focusedField === 'password' && 'text-primary'
                      )}
                    >
                      {t.auth.password}
                    </Label>
                    <Link
                      to="/forgot-password"
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      {t.auth.forgotPassword}
                    </Link>
                  </div>
                  <div className="relative group">
                    <div className={cn(
                      'absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-secondary opacity-0 blur-sm',
                      'transition-opacity duration-300',
                      focusedField === 'password' && 'opacity-30'
                    )} />
                    <div className="relative">
                      <Lock className={cn(
                        'absolute top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200',
                        isRTL ? 'right-4' : 'left-4',
                        focusedField === 'password' ? 'text-primary' : 'text-muted-foreground'
                      )} />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        className={cn(
                          'h-12 rounded-xl border-2 transition-all duration-200',
                          isRTL ? 'pr-12 pl-12' : 'pl-12 pr-12',
                          focusedField === 'password' 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border/50 hover:border-border'
                        )}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={cn(
                          'absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground',
                          'transition-colors duration-200',
                          isRTL ? 'left-4' : 'right-4'
                        )}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className={cn(
                    'w-full h-12 rounded-xl text-base font-medium',
                    'bg-gradient-to-r from-primary to-primary/90',
                    'shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40',
                    'transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]'
                  )} 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      {t.common.loading}
                    </div>
                  ) : t.auth.login}
                </Button>

                {/* Divider */}
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-3 text-muted-foreground">
                      {isRTL ? 'أو' : 'or'}
                    </span>
                  </div>
                </div>

                {/* Biometric Option (Visual Only) */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all duration-200"
                  disabled
                >
                  <Fingerprint className="h-5 w-5 me-2 text-primary" />
                  {isRTL ? 'تسجيل الدخول بالبصمة' : 'Sign in with Biometrics'}
                </Button>

                {/* Sign Up Link */}
                <p className="text-center text-sm text-muted-foreground pt-4">
                  {t.auth.noAccount}{' '}
                  <Link 
                    to="/signup" 
                    className="text-primary font-medium hover:underline"
                  >
                    {t.auth.signup}
                  </Link>
                </p>
              </form>
            </GlassCard>
          </div>

          {/* Bottom Quote */}
          <div className="text-center mt-8 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <p className={cn(
              'text-xs text-muted-foreground',
              isRTL ? 'font-arabic' : 'italic'
            )}>
              {isRTL 
                ? '"بسم الله توكلت على الله"'
                : '"In the name of Allah, I put my trust in Allah"'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
