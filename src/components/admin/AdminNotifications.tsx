import { Bell, Check, CheckCheck, Trash2, FileText, Calendar, Heart, AlertTriangle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
import { useLanguage } from '@/lib/i18n';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

export function AdminNotifications() {
  const { isRTL } = useLanguage();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearNotifications,
    isAdmin 
  } = useAdminNotifications();

  if (!isAdmin) return null;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'kyc_submission':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'new_booking':
        return <Calendar className="h-4 w-4 text-green-500" />;
      case 'donation':
        return <Heart className="h-4 w-4 text-pink-500" />;
      case 'dispute':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Settings className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getNotificationLink = (notification: { type: string; entityId?: string }) => {
    switch (notification.type) {
      case 'kyc_submission':
        return '/admin/kyc';
      case 'new_booking':
        return notification.entityId ? `/admin/bookings?id=${notification.entityId}` : '/admin/bookings';
      case 'donation':
        return '/admin/donations';
      case 'dispute':
        return notification.entityId ? `/admin/bookings?id=${notification.entityId}` : '/admin/bookings';
      default:
        return '/admin';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -end-1 h-5 min-w-[20px] flex items-center justify-center p-0 text-xs"
              variant="destructive"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>{isRTL ? 'الإشعارات' : 'Notifications'}</span>
          {notifications.length > 0 && (
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                onClick={(e) => {
                  e.preventDefault();
                  markAllAsRead();
                }}
                title={isRTL ? 'تحديد الكل كمقروء' : 'Mark all as read'}
              >
                <CheckCheck className="h-3 w-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                onClick={(e) => {
                  e.preventDefault();
                  clearNotifications();
                }}
                title={isRTL ? 'مسح الكل' : 'Clear all'}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            {isRTL ? 'لا توجد إشعارات' : 'No notifications'}
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            {notifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id}
                asChild
                className={`cursor-pointer ${!notification.isRead ? 'bg-muted/50' : ''}`}
              >
                <Link 
                  to={getNotificationLink(notification)}
                  onClick={() => markAsRead(notification.id)}
                  className="flex items-start gap-3 p-3"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${!notification.isRead ? 'font-semibold' : ''}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  )}
                </Link>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
