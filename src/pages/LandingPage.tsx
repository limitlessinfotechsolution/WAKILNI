import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, ArrowLeft, CheckCircle, Star, Users, Shield, Heart, 
  Sparkles, BadgeCheck, Globe, ChevronDown, MapPin, Play, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layout';
import { GlassCard } from '@/components/cards';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';

// Animated counter hook
function useAnimatedCounter(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isVisible, end, duration]);

  return { count, ref };
}

export default function LandingPage() {
  const { t, isRTL } = useLanguage();
  const { user, role } = useAuth();
  const [heroVisible, setHeroVisible] = useState(false);

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  useEffect(() => {
    setHeroVisible(true);
  }, []);

  const getDashboardLink = () => {
    if (!user) return '/signup';
    if (role === 'admin' || role === 'super_admin') return '/admin';
    if (role === 'provider') return '/provider';
    if (role === 'vendor') return '/vendor';
    return '/dashboard';
  };

  const stats = [
    { value: 10, suffix: 'K+', label: isRTL ? 'عميل سعيد' : 'Happy Clients', icon: Users },
    { value: 500, suffix: '+', label: isRTL ? 'مقدم خدمة معتمد' : 'Verified Providers', icon: Shield },
    { value: 25, suffix: 'K+', label: isRTL ? 'منسك مكتمل' : 'Completed Rites', icon: CheckCircle },
    { value: 4.9, suffix: '', label: isRTL ? 'متوسط التقييم' : 'Average Rating', isDecimal: true, icon: Star },
  ];

  const steps = [
    {
      icon: <Shield className="h-7 w-7" />,
      title: t.landing.step1Title,
      description: t.landing.step1Desc,
      tagline: isRTL ? 'مقدمون معتمدون وموثوقون' : 'Verified & Trusted Providers',
      gradient: 'from-primary to-primary/80',
    },
    {
      icon: <Heart className="h-7 w-7" />,
      title: t.landing.step2Title,
      description: t.landing.step2Desc,
      tagline: isRTL ? 'لأحبائك الذين لا يستطيعون السفر' : 'For loved ones who cannot travel',
      gradient: 'from-secondary to-secondary/80',
    },
    {
      icon: <CheckCircle className="h-7 w-7" />,
      title: t.landing.step3Title,
      description: t.landing.step3Desc,
      tagline: isRTL ? 'إثبات بالصور والفيديو' : 'Photo & Video Proof',
      gradient: 'from-info to-info/80',
    },
  ];

  const services = [
    {
      type: 'umrah',
      title: t.services.umrah,
      description: isRTL 
        ? 'أداء مناسك العمرة نيابة عمن لا يستطيع السفر'
        : 'Perform Umrah rites on behalf of those unable to travel',
      icon: '🕋',
      gradient: 'from-primary/10 to-primary/5',
      accentColor: 'text-primary',
      tagline: isRTL ? 'وَأَتِمُّوا الْحَجَّ وَالْعُمْرَةَ لِلَّهِ' : 'Complete Hajj and Umrah for Allah',
    },
    {
      type: 'hajj',
      title: t.services.hajj,
      description: isRTL
        ? 'أداء فريضة الحج نيابة عن المتوفين أو العاجزين'
        : 'Complete Hajj pilgrimage for the deceased or incapacitated',
      icon: '🕌',
      gradient: 'from-secondary/10 to-secondary/5',
      accentColor: 'text-secondary',
      tagline: isRTL ? 'وَلِلَّهِ عَلَى النَّاسِ حِجُّ الْبَيْتِ' : 'Hajj is a duty mankind owes to Allah',
    },
    {
      type: 'ziyarat',
      title: t.services.ziyarat,
      description: isRTL
        ? 'زيارة المسجد النبوي والمقدسات الأخرى'
        : "Visit the Prophet's Mosque and other sacred sites",
      icon: '🌙',
      gradient: 'from-info/10 to-info/5',
      accentColor: 'text-info',
      tagline: isRTL ? 'صَلاةٌ فِي مَسْجِدِي خَيْرٌ مِنْ أَلْفِ صَلاةٍ' : 'A prayer in my Masjid is worth a thousand',
    },
  ];

  const features = [
    {
      icon: <BadgeCheck className="h-5 w-5" />,
      title: isRTL ? 'مقدمون معتمدون' : 'Verified Providers',
      description: isRTL ? 'جميع مقدمي الخدمات معتمدون ومعتمدون' : 'All providers are verified and certified',
    },
    {
      icon: <Globe className="h-5 w-5" />,
      title: isRTL ? 'خدمة عالمية' : 'Global Service',
      description: isRTL ? 'متاح للعائلات في جميع أنحاء العالم' : 'Available for families worldwide',
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: isRTL ? 'ضمان الجودة' : 'Quality Guaranteed',
      description: isRTL ? 'ضمان استرداد الأموال خلال 7 أيام' : '7-day money-back guarantee',
    },
    {
      icon: <Heart className="h-5 w-5" />,
      title: isRTL ? 'دعم متواصل' : '24/7 Support',
      description: isRTL ? 'فريق دعم على مدار الساعة' : 'Round-the-clock assistance',
    },
  ];

  const testimonials = [
    {
      name: isRTL ? 'أحمد محمد' : 'Ahmed M.',
      role: isRTL ? 'مسافر' : 'Traveler',
      text: isRTL 
        ? 'خدمة ممتازة وأمينة. أديت العمرة لوالدتي المريضة وكانت تجربة رائعة.'
        : 'Excellent and trustworthy service. Performed Umrah for my ailing mother — an amazing experience.',
      rating: 5,
    },
    {
      name: isRTL ? 'فاطمة علي' : 'Fatima A.',
      role: isRTL ? 'مسافرة' : 'Traveler',
      text: isRTL 
        ? 'منصة سهلة الاستخدام ومقدمو خدمات محترفون. أنصح بها بشدة.'
        : 'Easy-to-use platform with professional providers. Highly recommended.',
      rating: 5,
    },
    {
      name: isRTL ? 'يوسف خالد' : 'Yousuf K.',
      role: isRTL ? 'مسافر' : 'Traveler',
      text: isRTL 
        ? 'تلقيت صور وفيديوهات الإثبات في نفس اليوم. خدمة شفافة وموثوقة.'
        : 'Received proof photos and videos the same day. Transparent and reliable service.',
      rating: 5,
    },
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden">
        {/* Simplified Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-primary/8 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-secondary/10 rounded-full blur-[80px]" />
          <div className="absolute inset-0 pattern-islamic opacity-30" />
        </div>

        <div className="container px-4 py-16 md:py-24">
          <div className={cn(
            'mx-auto max-w-3xl text-center transition-all duration-700',
            heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}>
            {/* Bismillah Badge */}
            <div className={cn(
              'mb-6 md:mb-8 transition-all duration-500 delay-100',
              heroVisible ? 'opacity-100' : 'opacity-0'
            )}>
              <span className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-full',
                'bg-primary/10 border border-primary/20',
                'text-primary text-sm font-medium',
                isRTL && 'font-arabic'
              )}>
                <Sparkles className="h-4 w-4" />
                {isRTL ? 'بسم الله الرحمن الرحيم' : 'In the name of Allah, the Most Gracious'}
              </span>
            </div>
            
            {/* Main Headline */}
            <h1 className={cn(
              'text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-5',
              'transition-all duration-500 delay-200',
              heroVisible ? 'opacity-100' : 'opacity-0',
              isRTL && 'font-arabic leading-relaxed'
            )}>
              {t.landing.heroTitle}
            </h1>
            
            {/* Subtitle */}
            <p className={cn(
              'text-base md:text-lg lg:text-xl text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed',
              'transition-all duration-500 delay-300',
              heroVisible ? 'opacity-100' : 'opacity-0',
              isRTL && 'font-arabic'
            )}>
              {t.landing.heroSubtitle}
            </p>
            
            {/* CTA Buttons */}
            <div className={cn(
              'flex flex-col sm:flex-row gap-3 justify-center mb-8',
              'transition-all duration-500 delay-400',
              heroVisible ? 'opacity-100' : 'opacity-0'
            )}>
              <Button 
                size="lg" 
                asChild 
                className={cn(
                  'text-base sm:text-lg px-8 h-13 md:h-14 rounded-2xl',
                  'shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/35',
                  'transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]'
                )}
              >
                <Link to={getDashboardLink()}>
                  {t.landing.cta}
                  <Arrow className="ms-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                asChild 
                className="text-base sm:text-lg px-8 h-13 md:h-14 rounded-2xl hover:bg-muted/50"
              >
                <Link to="/services">
                  <Play className="me-2 h-4 w-4" />
                  {t.landing.learnMore}
                </Link>
              </Button>
            </div>

            {/* Trust Indicators - Inline */}
            <div className={cn(
              'flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm text-muted-foreground',
              'transition-all duration-500 delay-500',
              heroVisible ? 'opacity-100' : 'opacity-0'
            )}>
              <div className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-primary" />
                <span>{isRTL ? 'مقدمون معتمدون' : 'Verified Providers'}</span>
              </div>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-border" />
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-secondary" />
                <span>{isRTL ? 'حجز فوري' : 'Instant Booking'}</span>
              </div>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-border" />
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>{isRTL ? 'إثبات مصور' : 'Photo Proof'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-5 w-5 text-muted-foreground/50" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-16 -mt-16 md:-mt-20 relative z-10">
        <div className="container px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto">
            {stats.map((stat, index) => {
              const { count, ref } = useAnimatedCounter(stat.isDecimal ? stat.value * 10 : stat.value);
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  ref={ref}
                  className={cn(
                    'bg-card/90 backdrop-blur-sm border border-border/50 rounded-2xl p-4 md:p-5 text-center',
                    'shadow-soft hover:shadow-medium transition-all duration-300',
                    'animate-fade-in'
                  )}
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="flex items-center justify-center mb-2">
                    <Icon className="h-4 w-4 text-primary/60" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold gradient-text-sacred mb-0.5">
                    {stat.isDecimal ? (count / 10).toFixed(1) : count}{stat.suffix}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="text-center mb-10 md:mb-14">
            <span className="inline-flex items-center gap-2 text-primary text-sm font-medium uppercase tracking-wider mb-3">
              <Sparkles className="h-4 w-4" />
              {isRTL ? 'خدماتنا' : 'Our Services'}
            </span>
            <h2 className={cn(
              'text-2xl md:text-3xl lg:text-4xl font-bold mb-3',
              isRTL && 'font-arabic'
            )}>
              {t.services.allServices}
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              {isRTL 
                ? 'اختر من بين خدماتنا لأداء المناسك نيابة عن أحبائك'
                : 'Choose from our services to perform sacred rites for your loved ones'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
            {services.map((service, index) => (
              <Link
                key={service.type}
                to={`/services?type=${service.type}`}
                className="group block"
              >
                <div 
                  className={cn(
                    'h-full rounded-2xl bg-card border border-border/50 p-6',
                    'shadow-soft hover:shadow-medium',
                    'transition-all duration-300 hover:-translate-y-1',
                    'animate-fade-in'
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={cn(
                    'w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-5',
                    'bg-gradient-to-br', service.gradient,
                    'group-hover:scale-110 transition-transform duration-300'
                  )}>
                    {service.icon}
                  </div>
                  
                  <h3 className={cn(
                    'text-xl font-bold mb-2',
                    isRTL && 'font-arabic'
                  )}>
                    {service.title}
                  </h3>
                  
                  <p className={cn(
                    'text-muted-foreground text-sm leading-relaxed mb-5',
                    isRTL && 'font-arabic'
                  )}>
                    {service.description}
                  </p>
                  
                  <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                    <p className={cn(
                      'text-xs text-muted-foreground/70 italic flex-1',
                      isRTL && 'font-arabic'
                    )}>
                      {service.tagline}
                    </p>
                    <Arrow className={cn(
                      'h-4 w-4 text-muted-foreground/40 group-hover:text-primary',
                      'group-hover:translate-x-1 transition-all duration-200'
                    )} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4">
          <div className="text-center mb-10 md:mb-14">
            <span className="inline-flex items-center gap-2 text-primary text-sm font-medium uppercase tracking-wider mb-3">
              <CheckCircle className="h-4 w-4" />
              {isRTL ? 'سهل وبسيط' : 'How It Works'}
            </span>
            <h2 className={cn(
              'text-2xl md:text-3xl lg:text-4xl font-bold mb-3',
              isRTL && 'font-arabic'
            )}>
              {t.landing.howItWorks}
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              {isRTL 
                ? 'ثلاث خطوات بسيطة لأداء المناسك نيابة عن أحبائك'
                : 'Three simple steps to perform rites for your loved ones'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="relative text-center animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Connector */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px bg-border" />
                )}
                
                {/* Step Circle */}
                <div className="relative inline-block mb-5">
                  <div className={cn(
                    'w-20 h-20 rounded-2xl flex items-center justify-center',
                    'bg-gradient-to-br text-primary-foreground shadow-lg',
                    'group-hover:scale-110 transition-transform',
                    step.gradient
                  )}>
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -end-2 w-7 h-7 rounded-full bg-background border-2 border-primary flex items-center justify-center text-xs font-bold text-primary shadow-sm">
                    {index + 1}
                  </div>
                </div>
                
                <h3 className={cn('text-lg font-bold mb-2', isRTL && 'font-arabic')}>
                  {step.title}
                </h3>
                <p className={cn('text-sm text-muted-foreground leading-relaxed mb-2', isRTL && 'font-arabic')}>
                  {step.description}
                </p>
                <span className="text-xs text-primary font-medium">{step.tagline}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-20">
        <div className="container px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={cn(
                  'bg-card border border-border/50 rounded-2xl p-5 text-center',
                  'shadow-soft hover:shadow-medium hover:-translate-y-0.5',
                  'transition-all duration-300 animate-fade-in'
                )}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="w-11 h-11 rounded-xl mx-auto mb-3 bg-primary/10 flex items-center justify-center text-primary">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-20 bg-muted/20">
        <div className="container px-4">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 text-primary text-sm font-medium uppercase tracking-wider mb-3">
              <Star className="h-4 w-4" />
              {isRTL ? 'آراء العملاء' : 'Testimonials'}
            </span>
            <h2 className={cn('text-2xl md:text-3xl font-bold', isRTL && 'font-arabic')}>
              {t.landing.trustedBy}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-card border border-border/50 rounded-2xl p-5 md:p-6 shadow-soft animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex gap-0.5 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-secondary text-secondary" />
                  ))}
                </div>
                <p className={cn(
                  'text-sm text-muted-foreground mb-4 leading-relaxed',
                  isRTL && 'font-arabic'
                )}>
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/90" />
        <div className="absolute inset-0 pattern-islamic opacity-10" />
        
        <div className="container px-4 relative z-10">
          <div className="text-center text-primary-foreground max-w-2xl mx-auto">
            <div className="flex justify-center gap-1 mb-5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-secondary text-secondary" />
              ))}
            </div>
            <p className={cn(
              'text-lg md:text-2xl font-semibold mb-3',
              isRTL && 'font-arabic'
            )}>
              {t.landing.trustedBy}
            </p>
            <p className="text-primary-foreground/80 text-sm md:text-base">
              {isRTL 
                ? 'انضم إلى الآلاف الذين وثقوا بنا لأداء المناسك'
                : 'Join thousands who have trusted us for their sacred rites'}
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-card border border-border/50 rounded-3xl p-8 md:p-12 shadow-elevated relative overflow-hidden">
              <div className="absolute inset-0 pattern-islamic opacity-10" />
              <div className="relative z-10">
                <Sparkles className="h-8 w-8 text-primary mx-auto mb-5" />
                <h2 className={cn(
                  'text-2xl md:text-3xl font-bold mb-3',
                  isRTL && 'font-arabic'
                )}>
                  {isRTL ? 'ابدأ رحلتك الروحانية اليوم' : 'Start Your Spiritual Journey Today'}
                </h2>
                <p className={cn(
                  'text-muted-foreground mb-7 max-w-md mx-auto',
                  isRTL && 'font-arabic'
                )}>
                  {isRTL 
                    ? 'انضم إلى آلاف العائلات التي وثقت بنا لأداء المناسك'
                    : 'Join thousands of families who have trusted us for their sacred rites'}
                </p>
                <Button 
                  size="lg" 
                  asChild 
                  className="text-base px-10 h-13 rounded-2xl shadow-xl shadow-primary/25"
                >
                  <Link to={getDashboardLink()}>
                    {t.landing.cta}
                    <Arrow className="ms-2 h-5 w-5" />
                  </Link>
                </Button>
                
                <p className={cn(
                  'mt-8 text-xs text-muted-foreground/60',
                  isRTL ? 'font-arabic' : 'italic'
                )}>
                  {isRTL 
                    ? '"إِذَا مَاتَ ابْنُ آدَمَ انْقَطَعَ عَمَلُهُ إِلَّا مِنْ ثَلَاثٍ"'
                    : '"When a person dies, their deeds are cut off except for three..."'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
