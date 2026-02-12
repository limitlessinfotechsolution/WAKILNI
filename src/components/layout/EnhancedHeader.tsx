import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, User, LogOut, LayoutDashboard, Settings, Heart, 
  Globe, ChevronDown, Moon, Sun, Sparkles, Download, 
  Zap, Shield, Building2, Star, Briefcase
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
import { usePWA } from '@/hooks/usePWA';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { cn } from '@/lib/utils';
import wakilniLogo from '@/assets/wakilni-logo.jpg';

interface EnhancedHeaderProps {
  showNav?: boolean;
}

const roleConfig = {
  traveler: { label: 'Traveler', labelAr: 'مسافر', gradient: 'from-emerald-500 to-teal-600', icon: Briefcase },
  provider: { label: 'Provider', labelAr: 'مقدم خدمة', gradient: 'from-amber-500 to-orange-600', icon: Star },
  vendor: { label: 'Vendor', labelAr: 'شركة', gradient: 'from-blue-500 to-indigo-600', icon: Building2 },
  admin: { label: 'Admin', labelAr: 'مشرف', gradient: 'from-purple-500 to-violet-600', icon: Shield },
  super_admin: { label: 'Super Admin', labelAr: 'المشرف الرئيسي', gradient: 'from-red-500 to-rose-600', icon: Zap },
};

export function EnhancedHeader({ showNav = true }: EnhancedHeaderProps) {
  const { t, isRTL, language, setLanguage } = useLanguage();
  const { user, profile, role, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { isInstallable, promptInstall } = usePWA();
  const navigate = useNavigate();
  const currentLocation = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const currentRole = roleConfig[role as keyof typeof roleConfig] || roleConfig.traveler;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getDashboardLink = () => {
    switch (role) {
      case 'admin': case 'super_admin': return '/admin';
      case 'provider': return '/provider';
      case 'vendor': return '/vendor';
      default: return '/dashboard';
    }
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
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
          ? 'bg-background/95 backdrop-blur-xl shadow-xs border-b border-border/40' 
          : 'bg-background/80 backdrop-blur-md'
      )}
    >
      <div className="container">
        <div className="flex h-14 md:h-16 items-center justify-between px-3 md:px-4 lg:px-0">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden shadow-soft group-hover:shadow-medium transition-shadow">
              <img src={wakilniLogo} alt="Wakilni" className="h-full w-full object-cover" />
            </div>
            <div className="hidden xs:flex flex-col">
              <span className={cn('text-lg font-bold leading-none', isRTL && 'font-arabic')}>
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

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            {/* Theme & Language toggles */}
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hidden sm:flex" onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}>
              <Globe className="h-4 w-4" />
            </Button>

            {/* PWA Install - Desktop only */}
            {isInstallable && (
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hidden lg:flex" onClick={promptInstall}>
                <Download className="h-4 w-4" />
              </Button>
            )}

            {/* Notifications */}
            {user && <NotificationBell />}

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 gap-2 px-2 hover:bg-muted/50 rounded-full">
                    <Avatar className="h-7 w-7 border-2 border-primary/20">
                      <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || ''} />
                      <AvatarFallback className={cn('bg-gradient-to-br text-white text-xs font-bold', currentRole.gradient)}>
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline text-sm font-medium">{profile?.full_name?.split(' ')[0] || 'User'}</span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground hidden md:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-60" align={isRTL ? 'start' : 'end'} sideOffset={8}>
                  {/* User Card */}
                  <div className="p-3 bg-muted/30 rounded-lg m-1.5 border border-border/50">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-primary/20">
                        <AvatarImage src={profile?.avatar_url || ''} />
                        <AvatarFallback className={cn('bg-gradient-to-br text-white font-bold', currentRole.gradient)}>
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{profile?.full_name || 'User'}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Badge className={cn('text-[9px] px-1.5 py-0 h-4 font-medium border-0 text-white', `bg-gradient-to-r ${currentRole.gradient}`)}>
                            {isRTL ? currentRole.labelAr : currentRole.label}
                          </Badge>
                          {profile?.display_id && (
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-mono font-bold">
                              {profile.display_id}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuGroup className="p-1">
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link to={getDashboardLink()} className="flex items-center gap-3 py-2 px-2.5">
                        <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{t.nav.dashboard}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link to="/settings/profile" className="flex items-center gap-3 py-2 px-2.5">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{t.nav.profile}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link to="/settings/profile" className="flex items-center gap-3 py-2 px-2.5">
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{t.nav.settings}</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive rounded-lg mx-1 mb-1">
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
                <Button size="sm" asChild className="rounded-full gap-1.5 shadow-soft hover:shadow-medium transition-shadow">
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
                
                <div className="p-3 space-y-1">
                  {/* Navigation Links */}
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
                          isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        )}
                      >
                        {Icon && <Icon className="h-4 w-4" />}
                        <span className={isRTL ? 'font-arabic' : ''}>{link.label}</span>
                      </Link>
                    );
                  })}

                  {/* Mobile Language Toggle */}
                  <button
                    onClick={() => { setLanguage(language === 'ar' ? 'en' : 'ar'); setMobileMenuOpen(false); }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 w-full transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    <span>{language === 'ar' ? 'English' : 'العربية'}</span>
                  </button>

                  {/* Auth buttons for non-logged-in */}
                  {!user && (
                    <div className="pt-3 mt-3 border-t space-y-2 px-1">
                      <Button asChild className="w-full rounded-xl" onClick={() => setMobileMenuOpen(false)}>
                        <Link to="/signup">
                          <Sparkles className="h-4 w-4 me-2" />
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
