import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';

export function Footer() {
  const { t, isRTL } = useLanguage();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className={`text-lg font-bold ${isRTL ? 'font-arabic' : ''}`}>و</span>
              </div>
              <span className={`text-xl font-semibold ${isRTL ? 'font-arabic' : ''}`}>
                {t.brand}
              </span>
            </Link>
            <p className={`text-muted-foreground max-w-md ${isRTL ? 'font-arabic' : ''}`}>
              {t.tagline}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">{t.nav.services}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/services?type=umrah" className="hover:text-foreground transition-colors">
                  {t.services.umrah}
                </Link>
              </li>
              <li>
                <Link to="/services?type=hajj" className="hover:text-foreground transition-colors">
                  {t.services.hajj}
                </Link>
              </li>
              <li>
                <Link to="/services?type=ziyarat" className="hover:text-foreground transition-colors">
                  {t.services.ziyarat}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">{t.footer.about}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/about" className="hover:text-foreground transition-colors">
                  {t.footer.about}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-foreground transition-colors">
                  {t.footer.contact}
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-foreground transition-colors">
                  {t.footer.faq}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className={`text-sm text-muted-foreground ${isRTL ? 'font-arabic' : ''}`}>
            {t.footer.copyright}
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground transition-colors">
              {t.footer.privacy}
            </Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">
              {t.footer.terms}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
