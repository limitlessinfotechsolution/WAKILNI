import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { LanguageToggle } from '@/components/LanguageToggle';

export default function LoginPage() {
  const { t, isRTL } = useLanguage();
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
          <CardHeader className="text-center">
            <CardTitle className={`text-2xl ${isRTL ? 'font-arabic' : ''}`}>
              {t.auth.login}
            </CardTitle>
            <CardDescription>{t.common.welcome}</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t.auth.password}</Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    {t.auth.forgotPassword}
                  </Link>
                </div>
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
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t.common.loading : t.auth.login}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                {t.auth.noAccount}{' '}
                <Link to="/signup" className="text-primary font-medium hover:underline">
                  {t.auth.signup}
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
