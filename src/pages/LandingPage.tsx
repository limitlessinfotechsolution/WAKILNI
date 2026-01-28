import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, CheckCircle, Star, Users, Shield, Heart, Sparkles, BadgeCheck, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layout';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';

export default function LandingPage() {
  const { t, isRTL } = useLanguage();
  const { user, role } = useAuth();

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const getDashboardLink = () => {
    if (!user) return '/signup';
    if (role === 'admin' || role === 'super_admin') return '/admin';
    if (role === 'provider') return '/provider';
    if (role === 'vendor') return '/vendor';
    return '/dashboard';
  };

  const steps = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: t.landing.step1Title,
      description: t.landing.step1Desc,
      tagline: isRTL ? 'مقدمون معتمدون وموثوقون' : 'Verified & Trusted Providers',
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: t.landing.step2Title,
      description: t.landing.step2Desc,
      tagline: isRTL ? 'لأحبائك الذين لا يستطيعون السفر' : 'For loved ones who cannot travel',
    },
    {
      icon: <CheckCircle className="h-8 w-8" />,
      title: t.landing.step3Title,
      description: t.landing.step3Desc,
      tagline: isRTL ? 'إثبات بالصور والفيديو' : 'Photo & Video Proof',
    },
  ];

  const services = [
    {
      type: 'umrah',
      title: t.services.umrah,
      titleAr: 'عمرة',
      description: isRTL 
        ? 'أداء مناسك العمرة نيابة عمن لا يستطيع السفر'
        : 'Perform Umrah rites on behalf of those unable to travel',
      icon: '🕋',
      gradient: 'from-emerald-500/20 to-teal-500/20',
      tagline: isRTL ? 'وَأَتِمُّوا الْحَجَّ وَالْعُمْرَةَ لِلَّهِ' : 'Complete Hajj and Umrah for Allah',
    },
    {
      type: 'hajj',
      title: t.services.hajj,
      titleAr: 'حج',
      description: isRTL
        ? 'أداء فريضة الحج نيابة عن المتوفين أو العاجزين'
        : 'Complete Hajj pilgrimage for the deceased or incapacitated',
      icon: '🕌',
      gradient: 'from-amber-500/20 to-orange-500/20',
      tagline: isRTL ? 'وَلِلَّهِ عَلَى النَّاسِ حِجُّ الْبَيْتِ' : 'Hajj is a duty mankind owes to Allah',
    },
    {
      type: 'ziyarat',
      title: t.services.ziyarat,
      titleAr: 'زيارة',
      description: isRTL
        ? 'زيارة المسجد النبوي والمقدسات الأخرى'
        : "Visit the Prophet's Mosque and other sacred sites",
      icon: '🌙',
      gradient: 'from-violet-500/20 to-purple-500/20',
      tagline: isRTL ? 'صَلاةٌ فِي مَسْجِدِي خَيْرٌ مِنْ أَلْفِ صَلاةٍ' : 'A prayer in my Masjid is worth a thousand',
    },
  ];

  const features = [
    {
      icon: <BadgeCheck className="h-6 w-6" />,
      title: isRTL ? 'مقدمون معتمدون' : 'Verified Providers',
      description: isRTL ? 'جميع مقدمي الخدمات معتمدون ومعتمدون' : 'All providers are verified and certified',
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: isRTL ? 'خدمة عالمية' : 'Global Service',
      description: isRTL ? 'متاح للعائلات في جميع أنحاء العالم' : 'Available for families worldwide',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: isRTL ? 'ضمان الجودة' : 'Quality Guaranteed',
      description: isRTL ? 'ضمان استرداد الأموال خلال 7 أيام' : '7-day money-back guarantee',
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: isRTL ? 'دعم متواصل' : '24/7 Support',
      description: isRTL ? 'فريق دعم على مدار الساعة' : 'Round-the-clock assistance',
    },
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32 pattern-islamic">
        <div className="container px-4">
          <div className="mx-auto max-w-4xl text-center">
            {/* Islamic Greeting */}
            <div className="mb-6">
              <span className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium',
                isRTL && 'font-arabic'
              )}>
                <Sparkles className="h-4 w-4" />
                {isRTL ? 'بسم الله الرحمن الرحيم' : 'In the name of Allah, the Most Gracious, the Most Merciful'}
              </span>
            </div>
            
            <h1 className={cn(
              'text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6',
              isRTL && 'font-arabic leading-relaxed'
            )}>
              {t.landing.heroTitle}
            </h1>
            
            <p className={cn(
              'text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto',
              isRTL && 'font-arabic'
            )}>
              {t.landing.heroSubtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg px-8 h-14 shadow-lg shadow-primary/30">
                <Link to={getDashboardLink()}>
                  {t.landing.cta}
                  <Arrow className="ms-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 h-14">
                <Link to="/services">{t.landing.learnMore}</Link>
              </Button>
            </div>

            {/* Trust Quote */}
            <div className={cn(
              'mt-12 p-4 rounded-2xl bg-card/50 backdrop-blur border border-border/50 max-w-xl mx-auto',
              isRTL && 'font-arabic'
            )}>
              <p className="text-sm text-muted-foreground italic">
                {isRTL 
                  ? '"مَنْ حَجَّ لِلَّهِ فَلَمْ يَرْفُثْ وَلَمْ يَفْسُقْ رَجَعَ كَيَوْمِ وَلَدَتْهُ أُمُّهُ"'
                  : '"Whoever performs Hajj for Allah and does not commit any obscenity or wrongdoing will return as pure as the day he was born"'}
              </p>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/5 to-transparent rounded-full blur-3xl" />
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-primary mb-4">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium">
                {isRTL ? 'خدماتنا' : 'Our Services'}
              </span>
            </div>
            <h2 className={cn('text-3xl font-bold mb-4', isRTL && 'font-arabic')}>
              {t.services.allServices}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {isRTL 
                ? 'اختر من بين خدماتنا المتنوعة لأداء المناسك نيابة عن أحبائك'
                : 'Choose from our range of services to perform sacred rites on behalf of your loved ones'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((service) => (
              <Link
                key={service.type}
                to={`/services?type=${service.type}`}
                className="group"
              >
                <div className={cn(
                  'relative overflow-hidden card-premium p-6 h-full transition-all duration-300 hover:shadow-xl',
                  'border-2 border-transparent hover:border-primary/30'
                )}>
                  {/* Gradient Background */}
                  <div className={cn(
                    'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                    service.gradient
                  )} />
                  
                  <div className="relative z-10">
                    <div className="text-5xl mb-4 transform transition-transform duration-300 group-hover:scale-110">
                      {service.icon}
                    </div>
                    <h3 className={cn(
                      'text-xl font-semibold mb-2 group-hover:text-primary transition-colors',
                      isRTL && 'font-arabic'
                    )}>
                      {service.title}
                    </h3>
                    <p className={cn('text-muted-foreground mb-4', isRTL && 'font-arabic')}>
                      {service.description}
                    </p>
                    <div className={cn(
                      'pt-4 border-t border-border/50 text-xs text-muted-foreground',
                      isRTL && 'font-arabic'
                    )}>
                      {service.tagline}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-primary mb-4">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">
                {isRTL ? 'سهل وبسيط' : 'Easy & Simple'}
              </span>
            </div>
            <h2 className={cn('text-3xl font-bold mb-4', isRTL && 'font-arabic')}>
              {t.landing.howItWorks}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {isRTL 
                ? 'ثلاث خطوات بسيطة لأداء المناسك نيابة عن أحبائك'
                : 'Three simple steps to perform rites on behalf of your loved ones'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-300">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-lg">
                    {index + 1}
                  </div>
                </div>
                <h3 className={cn('text-xl font-semibold mb-2', isRTL && 'font-arabic')}>
                  {step.title}
                </h3>
                <p className={cn('text-muted-foreground mb-2', isRTL && 'font-arabic')}>
                  {step.description}
                </p>
                <span className="text-xs text-primary font-medium">
                  {step.tagline}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="card-premium p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="container px-4">
          <div className="text-center">
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-secondary text-secondary" />
              ))}
            </div>
            <p className={cn('text-xl md:text-2xl font-medium mb-8', isRTL && 'font-arabic')}>
              {t.landing.trustedBy}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              <div className="p-4">
                <div className="text-4xl font-bold mb-1">10K+</div>
                <div className="text-primary-foreground/80 text-sm">
                  {isRTL ? 'عميل سعيد' : 'Happy Clients'}
                </div>
              </div>
              <div className="p-4">
                <div className="text-4xl font-bold mb-1">500+</div>
                <div className="text-primary-foreground/80 text-sm">
                  {isRTL ? 'مقدم خدمة معتمد' : 'Verified Providers'}
                </div>
              </div>
              <div className="p-4">
                <div className="text-4xl font-bold mb-1">25K+</div>
                <div className="text-primary-foreground/80 text-sm">
                  {isRTL ? 'منسك مكتمل' : 'Completed Rites'}
                </div>
              </div>
              <div className="p-4">
                <div className="text-4xl font-bold mb-1">4.9</div>
                <div className="text-primary-foreground/80 text-sm">
                  {isRTL ? 'متوسط التقييم' : 'Average Rating'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container px-4">
          <div className="card-premium p-8 md:p-12 text-center max-w-3xl mx-auto relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 pattern-islamic opacity-30" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 text-primary mb-4">
                <Sparkles className="h-5 w-5" />
              </div>
              <h2 className={cn('text-2xl md:text-3xl font-bold mb-4', isRTL && 'font-arabic')}>
                {isRTL ? 'ابدأ رحلتك الروحانية اليوم' : 'Start Your Spiritual Journey Today'}
              </h2>
              <p className={cn('text-muted-foreground mb-6', isRTL && 'font-arabic')}>
                {isRTL 
                  ? 'انضم إلى آلاف العائلات التي وثقت بنا لأداء المناسك نيابة عن أحبائهم'
                  : 'Join thousands of families who have trusted us to perform sacred rites for their loved ones'}
              </p>
              <Button size="lg" asChild className="shadow-lg shadow-primary/30">
                <Link to={getDashboardLink()}>
                  {t.landing.cta}
                  <Arrow className="ms-2 h-5 w-5" />
                </Link>
              </Button>
              
              {/* Bottom Quote */}
              <p className={cn(
                'mt-8 text-sm text-muted-foreground italic',
                isRTL && 'font-arabic'
              )}>
                {isRTL 
                  ? '"إِذَا مَاتَ ابْنُ آدَمَ انْقَطَعَ عَمَلُهُ إِلَّا مِنْ ثَلَاثٍ"'
                  : '"When a person dies, their deeds are cut off except for three..."'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
