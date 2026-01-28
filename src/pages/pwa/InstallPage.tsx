import { useState, useEffect } from 'react';
import { Download, Smartphone, Check, Share, Plus, ExternalLink, Wifi, WifiOff, Bell, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from '@/components/layout';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPage() {
  const { isRTL } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const features = [
    {
      icon: <Wifi className="h-6 w-6" />,
      title: isRTL ? 'العمل بدون اتصال' : 'Works Offline',
      description: isRTL 
        ? 'الوصول إلى الحجوزات والمعلومات المهمة حتى بدون اتصال بالإنترنت'
        : 'Access your bookings and important information even without internet',
    },
    {
      icon: <Bell className="h-6 w-6" />,
      title: isRTL ? 'إشعارات فورية' : 'Push Notifications',
      description: isRTL
        ? 'احصل على تحديثات فورية حول حالة الحجز والرسائل الجديدة'
        : 'Get instant updates about booking status and new messages',
    },
    {
      icon: <RefreshCw className="h-6 w-6" />,
      title: isRTL ? 'مزامنة تلقائية' : 'Auto Sync',
      description: isRTL
        ? 'تتم مزامنة بياناتك تلقائياً عند الاتصال بالإنترنت'
        : 'Your data syncs automatically when you go back online',
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: isRTL ? 'تجربة أصلية' : 'Native Experience',
      description: isRTL
        ? 'يعمل مثل تطبيق أصلي على جهازك'
        : 'Works just like a native app on your device',
    },
  ];

  return (
    <MainLayout>
      <div className="container py-12 px-4 max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            {isOnline ? (
              <Wifi className="h-4 w-4" />
            ) : (
              <WifiOff className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">
              {isOnline 
                ? (isRTL ? 'متصل بالإنترنت' : 'Online') 
                : (isRTL ? 'غير متصل' : 'Offline')}
            </span>
          </div>

          <h1 className={cn(
            'text-4xl md:text-5xl font-bold mb-4',
            isRTL && 'font-arabic'
          )}>
            {isRTL ? 'تثبيت تطبيق وكيلني' : 'Install Wakilni App'}
          </h1>
          
          <p className={cn(
            'text-lg text-muted-foreground max-w-2xl mx-auto',
            isRTL && 'font-arabic'
          )}>
            {isRTL 
              ? 'احصل على تجربة أفضل مع تطبيقنا المثبت على جهازك - يعمل بدون اتصال ويرسل إشعارات فورية'
              : 'Get a better experience with our installed app - works offline and sends instant notifications'}
          </p>
        </div>

        {/* Installation Status Card */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            <div className={cn(
              'w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center',
              isInstalled 
                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' 
                : 'bg-primary/10 text-primary'
            )}>
              {isInstalled ? (
                <Check className="h-10 w-10" />
              ) : (
                <Download className="h-10 w-10" />
              )}
            </div>
            
            <CardTitle className={cn('text-2xl', isRTL && 'font-arabic')}>
              {isInstalled 
                ? (isRTL ? 'التطبيق مثبت!' : 'App Installed!') 
                : (isRTL ? 'تثبيت التطبيق' : 'Install the App')}
            </CardTitle>
            
            <CardDescription className={isRTL ? 'font-arabic' : ''}>
              {isInstalled 
                ? (isRTL ? 'يمكنك الآن الوصول إلى وكيلني من شاشتك الرئيسية' : 'You can now access Wakilni from your home screen')
                : (isRTL ? 'أضف وكيلني إلى شاشتك الرئيسية للوصول السريع' : 'Add Wakilni to your home screen for quick access')}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            {isInstalled ? (
              <Badge variant="secondary" className="text-base px-4 py-2">
                <Check className="h-4 w-4 me-2" />
                {isRTL ? 'مثبت بنجاح' : 'Successfully Installed'}
              </Badge>
            ) : deferredPrompt ? (
              <Button size="lg" onClick={handleInstall} className="gap-2">
                <Download className="h-5 w-5" />
                {isRTL ? 'تثبيت الآن' : 'Install Now'}
              </Button>
            ) : isIOS ? (
              <div className="space-y-4">
                <p className={cn('text-muted-foreground', isRTL && 'font-arabic')}>
                  {isRTL 
                    ? 'لتثبيت التطبيق على iOS:' 
                    : 'To install the app on iOS:'}
                </p>
                <div className="flex flex-col gap-3 max-w-sm mx-auto text-start">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">1</div>
                    <span className={isRTL ? 'font-arabic' : ''}>
                      {isRTL ? 'اضغط على أيقونة المشاركة' : 'Tap the Share button'}
                      <Share className="inline h-4 w-4 mx-1" />
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">2</div>
                    <span className={isRTL ? 'font-arabic' : ''}>
                      {isRTL ? 'اختر "إضافة إلى الشاشة الرئيسية"' : 'Select "Add to Home Screen"'}
                      <Plus className="inline h-4 w-4 mx-1" />
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">3</div>
                    <span className={isRTL ? 'font-arabic' : ''}>
                      {isRTL ? 'اضغط "إضافة"' : 'Tap "Add"'}
                    </span>
                  </div>
                </div>
              </div>
            ) : isAndroid ? (
              <div className="space-y-4">
                <p className={cn('text-muted-foreground', isRTL && 'font-arabic')}>
                  {isRTL 
                    ? 'لتثبيت التطبيق على Android:' 
                    : 'To install the app on Android:'}
                </p>
                <div className="flex flex-col gap-3 max-w-sm mx-auto text-start">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">1</div>
                    <span className={isRTL ? 'font-arabic' : ''}>
                      {isRTL ? 'اضغط على قائمة المتصفح' : 'Tap the browser menu'}
                      <ExternalLink className="inline h-4 w-4 mx-1" />
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">2</div>
                    <span className={isRTL ? 'font-arabic' : ''}>
                      {isRTL ? 'اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية"' : 'Select "Install app" or "Add to Home screen"'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">3</div>
                    <span className={isRTL ? 'font-arabic' : ''}>
                      {isRTL ? 'اضغط "تثبيت"' : 'Tap "Install"'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className={cn('text-muted-foreground', isRTL && 'font-arabic')}>
                {isRTL 
                  ? 'افتح هذه الصفحة على هاتفك لتثبيت التطبيق'
                  : 'Open this page on your mobile device to install the app'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className={cn('font-semibold mb-1', isRTL && 'font-arabic')}>
                    {feature.title}
                  </h3>
                  <p className={cn('text-sm text-muted-foreground', isRTL && 'font-arabic')}>
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
