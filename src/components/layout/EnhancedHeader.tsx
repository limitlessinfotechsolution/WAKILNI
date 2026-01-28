import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, User, LogOut, LayoutDashboard, Settings, Heart, 
  Globe, Wifi, WifiOff, MapPin, ChevronDown,
  Moon, Sun, Sparkles, Download, Bell
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

interface EnhancedHeaderProps {
  showNav?: boolean;
}

export function EnhancedHeader({ showNav = true }: EnhancedHeaderProps) {
  const { t, isRTL, language, setLanguage } = useLanguage();
  const { user, profile, role, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { location: geoLocation, currency } = useGeolocation();
  const { isOnline, pendingCount } = useOfflineSync();
  const { isInstallable, promptInstall } = usePWA();
  const navigate = useNavigate();
  const currentLocation = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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

  const getRoleBadge = () => {
    const roleConfig: Record<string, { color: string; label: { en: string; ar: string } }> = {
      super_admin: { color: 'bg-gradient-to-r from-red-500 to-rose-600 text-white', label: { en: 'Super Admin', ar: 'المشرف الرئيسي' } },
      admin: { color: 'bg-gradient-to-r from-purple-500 to-violet-600 text-white', label: { en: 'Admin', ar: 'مشرف' } },
      provider: { color: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white', label: { en: 'Provider', ar: 'مقدم خدمة' } },
      vendor: { color: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white', label: { en: 'Vendor', ar: 'شركة' } },
      traveler: { color: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white', label: { en: 'Traveler', ar: 'مسافر' } },
    };

    if (!role) return null;
    const config = roleConfig[role];
    
    return (
      <Badge className={cn('text-[10px] px-2 py-0.5 font-medium border-0', config?.color)}>
        {isRTL ? config?.label.ar : config?.label.en}
      </Badge>
    );
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
        'sticky top-0 z-50 w-full transition-all duration-500',
        scrolled 
          ? 'bg-background/98 backdrop-blur-xl shadow-lg shadow-primary/5 border-b border-border/50' 
          : 'bg-background/90 backdrop-blur-md'
      )}
    >
      {/* Premium Top Bar - Only show on landing pages, not dashboard */}
      {showNav && (
        <div className="hidden lg:block bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 border-b border-border/30">
          <div className="container">
            <div className="flex items-center justify-between py-2 px-4 text-xs">
              <div className="flex items-center gap-6">
                {/* Location & Currency */}
                {geoLocation && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/80 border border-border/50">
                      <MapPin className="h-3 w-3 text-primary" />
                      <span className="font-medium">{geoLocation.city}, {geoLocation.country_name}</span>
                      <Separator orientation="vertical" className="h-3 mx-1" />
                      <span className="text-primary font-semibold">({currency.code})</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Install PWA Button */}
                {isInstallable && (
                  <button
                    onClick={promptInstall}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Download className="h-3 w-3" />
                    {isRTL ? 'تثبيت التطبيق' : 'Install App'}
                  </button>
                )}

                {/* Theme Toggle */}
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                >
                  {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                  <span className="font-medium">{theme === 'dark' ? (isRTL ? 'فاتح' : 'Light') : (isRTL ? 'داكن' : 'Dark')}</span>
                </button>

                {/* Language Toggle */}
                <button
                  onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span className="font-medium">{language === 'ar' ? 'English' : 'العربية'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Header */}
      <div className="container">
        <div className="flex h-16 items-center justify-between px-4 lg:px-0">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary to-emerald-600 text-primary-foreground shadow-lg shadow-primary/25 group-hover:shadow-xl group-hover:shadow-primary/30 transition-all duration-300">
                <span className={`text-xl font-bold ${isRTL ? 'font-arabic' : ''}`}>و</span>
              </div>
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm" />
            </div>
            <div className="flex flex-col">
              <span className={cn(
                'text-xl font-bold text-foreground leading-none tracking-tight',
                isRTL && 'font-arabic'
              )}>
                {t.brand}
              </span>
              <span className="text-[10px] text-muted-foreground hidden sm:block mt-0.5 font-medium">
                {isRTL ? 'خدمات العمرة والحج' : 'Umrah & Hajj Services'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {showNav && (
            <nav className="hidden lg:flex items-center gap-1 bg-muted/30 rounded-full px-2 py-1.5 border border-border/50">
              {navLinks.map((link) => {
                const isActive = currentLocation.pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/80'
                    )}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    <span className={isRTL ? 'font-arabic' : ''}>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Quick Actions */}
            <div className="lg:hidden flex items-center gap-1">
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
                    className="relative h-11 gap-2.5 px-2 hover:bg-muted/50 rounded-full border border-transparent hover:border-border/50 transition-all"
                  >
                    <Avatar className="h-9 w-9 border-2 border-primary/30 shadow-sm">
                      <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || ''} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-sm font-semibold">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col items-start">
                      <span className="text-sm font-semibold leading-tight">
                        {profile?.full_name?.split(' ')[0] || 'User'}
                      </span>
                      {getRoleBadge()}
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72" align={isRTL ? 'start' : 'end'} sideOffset={8}>
                  {/* User Profile Card */}
                  <div className="p-4 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg m-2 border border-border/50">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-14 w-14 border-2 border-primary/30 shadow-md">
                        <AvatarImage src={profile?.avatar_url || ''} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-lg font-bold">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate text-foreground">{profile?.full_name || 'User'}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        <div className="mt-1.5">{getRoleBadge()}</div>
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuGroup className="p-1">
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link to={getDashboardLink()} className="flex items-center gap-3 py-2.5 px-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <LayoutDashboard className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">{t.nav.dashboard}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link to="/settings/profile" className="flex items-center gap-3 py-2.5 px-3">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="font-medium">{t.nav.profile}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link to="/settings/profile" className="flex items-center gap-3 py-2.5 px-3">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                          <Settings className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="font-medium">{t.nav.settings}</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Status Footer */}
                  <div className="px-3 py-2 mx-2 mb-1 rounded-lg bg-muted/50 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        {isOnline ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                        )}
                        <span className="text-muted-foreground">{isOnline ? 'Online' : 'Offline'}</span>
                      </span>
                      {geoLocation && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {geoLocation.country_code}
                        </span>
                      )}
                    </div>
                  </div>
                  
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
                <Button variant="ghost" asChild className="rounded-full font-medium">
                  <Link to="/login">{t.nav.login}</Link>
                </Button>
                <Button asChild className="rounded-full gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
                  <Link to="/signup">
                    <Sparkles className="h-4 w-4" />
                    {t.nav.signup}
                  </Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden h-10 w-10 rounded-full">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side={isRTL ? 'left' : 'right'} className="w-80 p-0">
                <SheetHeader className="p-6 pb-4 border-b bg-gradient-to-br from-primary/5 to-secondary/5">
                  <SheetTitle className={cn('text-start', isRTL && 'font-arabic text-end')}>
                    {isRTL ? 'القائمة' : 'Menu'}
                  </SheetTitle>
                </SheetHeader>
                
                <div className="p-4">
                  {/* Status Bar */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border/50 mb-4">
                    <div className="flex items-center gap-2">
                      {isOnline ? (
                        <div className="flex items-center gap-1.5 text-emerald-600">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-sm font-medium">Online</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-amber-600">
                          <WifiOff className="h-4 w-4" />
                          <span className="text-sm font-medium">Offline</span>
                        </div>
                      )}
                    </div>
                    {geoLocation && (
                      <Badge variant="secondary" className="text-xs">
                        {geoLocation.country_code} • {currency.code}
                      </Badge>
                    )}
                  </div>

                  {/* Navigation Links */}
                  <nav className="space-y-1">
                    {navLinks.map((link) => {
                      const Icon = link.icon;
                      const isActive = currentLocation.pathname === link.href;
                      return (
                        <Link
                          key={link.href}
                          to={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                            isActive 
                              ? 'bg-primary text-primary-foreground shadow-sm' 
                              : 'hover:bg-muted'
                          )}
                        >
                          {Icon && <Icon className="h-5 w-5" />}
                          <span className={cn('font-medium', isRTL && 'font-arabic')}>{link.label}</span>
                        </Link>
                      );
                    })}
                  </nav>
                  
                  {/* Install App Button */}
                  {isInstallable && (
                    <Button 
                      onClick={promptInstall} 
                      className="w-full mt-4 gap-2 rounded-xl"
                    >
                      <Download className="h-4 w-4" />
                      {isRTL ? 'تثبيت التطبيق' : 'Install App'}
                    </Button>
                  )}
                  
                  {!user && (
                    <div className="flex flex-col gap-2 mt-6 pt-4 border-t">
                      <Button variant="outline" asChild className="w-full rounded-xl">
                        <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                          {t.nav.login}
                        </Link>
                      </Button>
                      <Button asChild className="w-full rounded-xl gap-2">
                        <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                          <Sparkles className="h-4 w-4" />
                          {t.nav.signup}
                        </Link>
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
