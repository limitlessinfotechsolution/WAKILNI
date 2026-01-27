import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';

export function LanguageToggle() {
  const { language, setLanguage, isRTL } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="gap-2 font-medium"
    >
      <Globe className="h-4 w-4" />
      <span className={isRTL ? 'font-arabic' : ''}>
        {language === 'en' ? 'العربية' : 'English'}
      </span>
    </Button>
  );
}
