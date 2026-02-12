import { Link } from 'react-router-dom';
import { Heart, Globe, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export function EnhancedFooter() {
  const { t, isRTL, language, setLanguage } = useLanguage();

  const serviceLinks = [
    { href: '/services?type=umrah', label: t.services.umrah, labelAr: 'العمرة' },
    { href: '/services?type=hajj', label: t.services.hajj, labelAr: 'الحج' },
    { href: '/services?type=ziyarat', label: t.services.ziyarat, labelAr: 'الزيارة' },
  ];

  const companyLinks = [
    { href: '/about', label: 'About Us', labelAr: 'عن وكّلني' },
    { href: '/contact', label: 'Contact', labelAr: 'اتصل بنا' },
    { href: '/faq', label: 'FAQ', labelAr: 'الأسئلة الشائعة' },
  ];

  const legalLinks = [
    { href: '/privacy', label: 'Privacy Policy', labelAr: 'سياسة الخصوصية' },
    { href: '/terms', label: 'Terms of Service', labelAr: 'شروط الخدمة' },
    { href: '/refund', label: 'Refund Policy', labelAr: 'سياسة الاسترداد' },
  ];

  return (
    <footer className="bg-muted/20 border-t border-border/50">
      <div className="container px-4 py-10 md:py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
                <span className={isRTL ? 'font-arabic' : ''}>و</span>
              </div>
              <span className={cn('text-base font-bold', isRTL && 'font-arabic')}>
                {t.brand}
              </span>
            </Link>
            <p className={cn('text-sm text-muted-foreground max-w-xs mb-4 leading-relaxed', isRTL && 'font-arabic')}>
              {t.tagline}
            </p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>{isRTL ? 'مكة المكرمة، السعودية' : 'Makkah, Saudi Arabia'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>support@wakilni.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                <span dir="ltr">+966 12 345 6789</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-sm mb-3">
              {isRTL ? 'خدماتنا' : 'Services'}
            </h4>
            <ul className="space-y-2 text-sm">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {isRTL ? link.labelAr : link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/donate" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                  <Heart className="h-3 w-3 text-destructive" />
                  {isRTL ? 'تبرع' : 'Donate'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-sm mb-3">
              {isRTL ? 'الشركة' : 'Company'}
            </h4>
            <ul className="space-y-2 text-sm">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {isRTL ? link.labelAr : link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-sm mb-3">
              {isRTL ? 'القانونية' : 'Legal'}
            </h4>
            <ul className="space-y-2 text-sm">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {isRTL ? link.labelAr : link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/30">
        <div className="container px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-muted-foreground">
            <p className={isRTL ? 'font-arabic' : ''}>{t.footer.copyright}</p>
            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>{language === 'ar' ? 'English' : 'العربية'}</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
