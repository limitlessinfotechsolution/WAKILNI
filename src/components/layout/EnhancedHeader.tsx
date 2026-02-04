import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, User, LogOut, LayoutDashboard, Settings, Heart, 
  Globe, MapPin, ChevronDown,
  Moon, Sun, Sparkles, Download, Zap, Shield, Building2, Star, Briefcase
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/hooks/useTheme';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { usePWA } from '@/hooks/usePWA';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { cn } from '@/lib/utils';
import wakilniLogo from '@/assets/wakilni-logo.jpg';

interface EnhancedHeaderProps {
  showNav?: boolean;
}

const roleConfig = {
  traveler: {
    label: 'Traveler',
    labelAr: 'مسافر',
    gradient: 'from-emerald-500 to-teal-600',
    icon: Briefcase,
  },
  provider: {
    label: 'Provider',
    labelAr: 'مقدم خدمة',
    gradient: 'from-amber-500 to-orange-600',
    icon: Star,
  },
  vendor: {
    label: 'Vendor',
    labelAr: 'شركة',
    gradient: 'from-blue-500 to-indigo-600',
    icon: Building2,
  },
  admin: {
    label: 'Admin',
    labelAr: 'مشرف',
    gradient: 'from-purple-500 to-violet-600',
    icon: Shield,
  },
  super_admin: {
    label: 'Super Admin',
    labelAr: 'المشرف الرئيسي',
    gradient: 'from-red-500 to-rose-600',
    icon: Zap,
  },
};

export function EnhancedHeader({ showNav = true }: EnhancedHeaderProps) {
  const { t, isRTL, language, setLanguage } = useLanguage();
  const { user, profile, role, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { location: geoLocation, currency } = useGeolocation();
  const { isOnline } = useOfflineSync();
  const { isInstallable, promptInstall } = usePWA();
  const navigate = useNavigate();
  const currentLocation = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const currentRole = roleConfig[role as keyof typeof roleConfig] || roleConfig.traveler;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getDashboardLink = () => {
    switch (role) {
      case 'admin':
      case 'super_admin':
        return '/admin';
      case 'provider':
        return '/provider';
      case 'vendor':
        return '/vendor';
      default:
        return '/dashboard';
    }
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0].toUpperCase() || 'U';
  };

  const navLinks = [
    { href: '/services', label: t.nav.services },
    { href: '/donate', label: isRTL ? 'تبرع' : 'Donate', icon: Heart },
  ];

  if (user) {
    navLinks.push(
      { href: getDashboardLink(), label: t.nav.dashboard },
      { href: '/bookings', label: t.nav.bookings }
    );
  }

  return (
    <header 
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled 
          ? 'bg-background/95 backdrop-blur-xl shadow-sm border-b border-border/50' 
          : 'bg-background/80 backdrop-blur-md'
      )}
    >
      {/* Compact Top Bar - Only show on public pages */}
      {showNav && (
        <div className="hidden lg:block border-b border-border/30 bg-muted/30">
          <div className="container">
            <div className="flex items-center justify-between py-1.5 px-4 text-xs">
              <div className="flex items-center gap-4">
                {/* Location & Currency */}
                {geoLocation && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="font-medium">{geoLocation.city}, {geoLocation.country_code}</span>
                    <span className="text-primary font-semibold">({currency.code})</span>
                  </div>
                )}
                
                {/* Online Status */}
                <div className="flex items-center gap-1.5">
                  <span className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  )} />
                  <span className="text-muted-foreground text-[11px]">
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Install PWA Button */}
                {isInstallable && (
                  <button
                    onClick={promptInstall}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-[11px] font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Download className="h-3 w-3" />
                    {isRTL ? 'تثبيت' : 'Install'}
                  </button>
                )}

                <Separator orientation="vertical" className="h-3" />

                {/* Theme Toggle */}
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                >
                  {theme === 'dark' ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
                </button>

                {/* Language Toggle */}
                <button
                  onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                >
                  <Globe className="h-3 w-3" />
                  <span className="font-medium text-[11px]">{language === 'ar' ? 'EN' : 'عربي'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Header */}
      <div className="container">
        <div className="flex h-14 items-center justify-between px-3 md:px-4 lg:px-0">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-shadow">
                <img src={wakilniLogo} alt="Wakilni" className="h-full w-full object-cover" />
              </div>
            </div>
            <div className="hidden xs:flex flex-col">
              <span className={cn(
                'text-lg font-bold leading-none',
                isRTL && 'font-arabic'
              )}>
                {t.brand}
              </span>
              <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">
                {isRTL ? 'الحج والعمرة' : 'Hajj & Umrah'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {showNav && (
            <nav className="hidden lg:flex items-center gap-1 bg-muted/40 rounded-full px-1.5 py-1 border border-border/40">
              {navLinks.map((link) => {
                const isActive = currentLocation.pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      'flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-full transition-all',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/80'
                    )}
                  >
                    {Icon && <Icon className="h-3.5 w-3.5" />}
                    <span className={isRTL ? 'font-arabic' : ''}>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center gap-1">
            {/* Mobile Quick Actions */}
            <div className="lg:hidden flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              >
                <Globe className="h-4 w-4" />
              </Button>
            </div>

            {/* Notifications */}
            {user && <NotificationBell />}

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="relative h-10 gap-2 px-2 hover:bg-muted/50 rounded-full border border-transparent hover:border-border/50 transition-all"
                  >
                    <Avatar className="h-8 w-8 border-2 border-primary/20">
                      <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || ''} />
                      <AvatarFallback className={cn(
                        'bg-gradient-to-br text-white text-sm font-bold',
                        currentRole.gradient
                      )}>
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col items-start">
                      <span className="text-sm font-semibold leading-tight">
                        {profile?.full_name?.split(' ')[0] || 'User'}
                      </span>
                      <Badge className={cn(
                        'text-[9px] px-1.5 py-0 h-4 font-medium border-0 text-white',
                        `bg-gradient-to-r ${currentRole.gradient}`
                      )}>
                        {isRTL ? currentRole.labelAr : currentRole.label}
                      </Badge>
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden md:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align={isRTL ? 'start' : 'end'} sideOffset={8}>
                  {/* User Profile Card */}
                  <div className="p-3 bg-gradient-to-br from-muted/50 to-muted/30 rounded-lg m-1.5 border border-border/50">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 border-primary/20">
                        <AvatarImage src={profile?.avatar_url || ''} />
                        <AvatarFallback className={cn(
                          'bg-gradient-to-br text-white text-lg font-bold',
                          currentRole.gradient
                        )}>
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate">{profile?.full_name || 'User'}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        <Badge className={cn(
                          'mt-1 text-[9px] px-1.5 py-0 h-4 font-medium border-0 text-white',
                          `bg-gradient-to-r ${currentRole.gradient}`
                        )}>
                          {isRTL ? currentRole.labelAr : currentRole.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuGroup className="p-1">
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link to={getDashboardLink()} className="flex items-center gap-3 py-2 px-2.5">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                          <LayoutDashboard className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="font-medium text-sm">{t.nav.dashboard}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link to="/settings/profile" className="flex items-center gap-3 py-2 px-2.5">
                        <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <span className="font-medium text-sm">{t.nav.profile}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link to="/settings/profile" className="flex items-center gap-3 py-2 px-2.5">
                        <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                          <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <span className="font-medium text-sm">{t.nav.settings}</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={handleSignOut} 
                    className="cursor-pointer text-destructive focus:text-destructive rounded-lg mx-1 mb-1"
                  >
                    <LogOut className="h-4 w-4 me-3" />
                    <span className="font-medium">{t.nav.logout}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild className="rounded-full font-medium">
                  <Link to="/login">{t.nav.login}</Link>
                </Button>
                <Button size="sm" asChild className="rounded-full gap-1.5 shadow-md shadow-primary/20 hover:shadow-primary/30 transition-shadow">
                  <Link to="/signup">
                    <Sparkles className="h-3.5 w-3.5" />
                    {t.nav.signup}
                  </Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9 rounded-full">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side={isRTL ? 'left' : 'right'} className="w-72 p-0">
                <SheetHeader className="p-4 pb-3 border-b">
                  <SheetTitle className={cn('text-start text-base', isRTL && 'font-arabic text-end')}>
                    {isRTL ? 'القائمة' : 'Menu'}
                  </SheetTitle>
                </SheetHeader>
                
                <div className="p-3">
                  {/* Navigation Links */}
                  <nav className="space-y-1">
                    {navLinks.map((link) => {
                      const isActive = currentLocation.pathname === link.href;
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.href}
                          to={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                          )}
                        >
                          {Icon && <Icon className="h-4 w-4" />}
                          <span className={isRTL ? 'font-arabic' : ''}>{link.label}</span>
                        </Link>
                      );
                    })}
                  </nav>
                  
                  <Separator className="my-4" />
                  
                  {/* Auth Buttons for non-logged in users */}
                  {!user && (
                    <div className="space-y-2">
                      <Button asChild className="w-full rounded-xl gap-2" onClick={() => setMobileMenuOpen(false)}>
                        <Link to="/signup">
                          <Sparkles className="h-4 w-4" />
                          {t.nav.signup}
                        </Link>
                      </Button>
                      <Button variant="outline" asChild className="w-full rounded-xl" onClick={() => setMobileMenuOpen(false)}>
                        <Link to="/login">{t.nav.login}</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
