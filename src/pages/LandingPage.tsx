import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, CheckCircle, Star, Users, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layout';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';

export default function LandingPage() {
  const { t, isRTL } = useLanguage();
  const { user, role } = useAuth();

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const getDashboardLink = () => {
    if (!user) return '/signup';
    if (role === 'admin') return '/admin';
    if (role === 'provider') return '/provider';
    return '/dashboard';
  };

  const steps = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: t.landing.step1Title,
      description: t.landing.step1Desc,
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: t.landing.step2Title,
      description: t.landing.step2Desc,
    },
    {
      icon: <CheckCircle className="h-8 w-8" />,
      title: t.landing.step3Title,
      description: t.landing.step3Desc,
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
    },
    {
      type: 'hajj',
      title: t.services.hajj,
      titleAr: 'حج',
      description: isRTL
        ? 'أداء فريضة الحج نيابة عن المتوفين أو العاجزين'
        : 'Complete Hajj pilgrimage for the deceased or incapacitated',
      icon: '🌙',
    },
    {
      type: 'ziyarat',
      title: t.services.ziyarat,
      titleAr: 'زيارة',
      description: isRTL
        ? 'زيارة المسجد النبوي والمقدسات الأخرى'
        : "Visit the Prophet's Mosque and other sacred sites",
      icon: '⭐',
    },
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="container px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 ${isRTL ? 'font-arabic leading-relaxed' : ''}`}>
              {t.landing.heroTitle}
            </h1>
            <p className={`text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto ${isRTL ? 'font-arabic' : ''}`}>
              {t.landing.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg px-8">
                <Link to={getDashboardLink()}>
                  {t.landing.cta}
                  <Arrow className="ms-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8">
                <Link to="/services">{t.landing.learnMore}</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4">
          <h2 className={`text-3xl font-bold text-center mb-12 ${isRTL ? 'font-arabic' : ''}`}>
            {t.services.allServices}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((service) => (
              <Link
                key={service.type}
                to={`/services?type=${service.type}`}
                className="group"
              >
                <div className="card-premium p-6 h-full hover:border-primary transition-colors">
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h3 className={`text-xl font-semibold mb-2 group-hover:text-primary transition-colors ${isRTL ? 'font-arabic' : ''}`}>
                    {service.title}
                  </h3>
                  <p className={`text-muted-foreground ${isRTL ? 'font-arabic' : ''}`}>
                    {service.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container px-4">
          <h2 className={`text-3xl font-bold text-center mb-4 ${isRTL ? 'font-arabic' : ''}`}>
            {t.landing.howItWorks}
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            {isRTL ? 'ثلاث خطوات بسيطة لأداء المناسك نيابة عن أحبائك' : 'Three simple steps to perform rites on behalf of your loved ones'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  {step.icon}
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  {isRTL ? `${index + 1} الخطوة` : `Step ${index + 1}`}
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${isRTL ? 'font-arabic' : ''}`}>
                  {step.title}
                </h3>
                <p className={`text-muted-foreground ${isRTL ? 'font-arabic' : ''}`}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container px-4">
          <div className="text-center">
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-secondary text-secondary" />
              ))}
            </div>
            <p className={`text-xl md:text-2xl font-medium mb-8 ${isRTL ? 'font-arabic' : ''}`}>
              {t.landing.trustedBy}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
              <div>
                <div className="text-3xl font-bold">10K+</div>
                <div className="text-primary-foreground/80 text-sm">
                  {isRTL ? 'عميل سعيد' : 'Happy Clients'}
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold">500+</div>
                <div className="text-primary-foreground/80 text-sm">
                  {isRTL ? 'مقدم خدمة معتمد' : 'Verified Providers'}
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold">25K+</div>
                <div className="text-primary-foreground/80 text-sm">
                  {isRTL ? 'منسك مكتمل' : 'Completed Rites'}
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold">4.9</div>
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
          <div className="card-premium p-8 md:p-12 text-center max-w-3xl mx-auto">
            <h2 className={`text-2xl md:text-3xl font-bold mb-4 ${isRTL ? 'font-arabic' : ''}`}>
              {isRTL ? 'ابدأ رحلتك الروحانية اليوم' : 'Start Your Spiritual Journey Today'}
            </h2>
            <p className={`text-muted-foreground mb-6 ${isRTL ? 'font-arabic' : ''}`}>
              {isRTL 
                ? 'انضم إلى آلاف العائلات التي وثقت بنا لأداء المناسك نيابة عن أحبائهم'
                : 'Join thousands of families who have trusted us to perform sacred rites for their loved ones'}
            </p>
            <Button size="lg" asChild>
              <Link to={getDashboardLink()}>
                {t.landing.cta}
                <Arrow className="ms-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
