import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GlassCard } from '@/components/cards';
import { useLanguage } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import wakilniLogo from '@/assets/wakilni-logo.jpg';

export default function ForgotPasswordPage() {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) throw error;
      setIsSent(true);
    } catch (error: any) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message || (isRTL ? 'فشل في إرسال رابط إعادة التعيين' : 'Failed to send reset link'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
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
          <span className={cn('text-xl font-semibold gradient-text-sacred', isRTL && 'font-arabic')}>
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
          <div className="relative p-px rounded-3xl bg-gradient-to-br from-primary/50 via-transparent to-secondary/50">
            <GlassCard className="rounded-[23px] p-8">
              {isSent ? (
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className={cn('text-2xl font-bold', isRTL && 'font-arabic')}>
                    {isRTL ? 'تم الإرسال!' : 'Check Your Email'}
                  </h2>
                  <p className="text-muted-foreground">
                    {isRTL
                      ? `تم إرسال رابط إعادة تعيين كلمة المرور إلى ${email}`
                      : `We've sent a password reset link to ${email}`}
                  </p>
                  <Link to="/login">
                    <Button variant="outline" className="mt-4 gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      {isRTL ? 'العودة لتسجيل الدخول' : 'Back to Login'}
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <div className={cn(
                      'inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 overflow-hidden',
                      'shadow-xl shadow-primary/30 animate-scale-in'
                    )}>
                      <img src={wakilniLogo} alt="Wakilni" className="h-full w-full object-cover" />
                    </div>
                    <h1 className={cn('text-2xl md:text-3xl font-bold mb-2', isRTL && 'font-arabic')}>
                      {t.auth.resetPassword}
                    </h1>
                    <p className="text-muted-foreground">
                      {isRTL
                        ? 'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين'
                        : 'Enter your email and we\'ll send you a reset link'}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email">{t.auth.email}</Label>
                      <div className="relative">
                        <Mail className={cn(
                          'absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground',
                          isRTL ? 'right-4' : 'left-4'
                        )} />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={cn('h-12 rounded-xl', isRTL ? 'pr-12' : 'pl-12')}
                          required
                        />
                      </div>
                    </div>

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
                          {isRTL ? 'جاري الإرسال...' : 'Sending...'}
                        </div>
                      ) : (isRTL ? 'إرسال رابط إعادة التعيين' : 'Send Reset Link')}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground pt-2">
                      <Link to="/login" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
                        <ArrowLeft className="h-3 w-3" />
                        {isRTL ? 'العودة لتسجيل الدخول' : 'Back to Login'}
                      </Link>
                    </p>
                  </form>
                </>
              )}
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
}
