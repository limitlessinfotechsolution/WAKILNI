import { useState } from 'react';
import { MessageSquare, ArrowLeft, ArrowRight, Inbox } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard, GlassCardContent, GlassCardHeader } from '@/components/cards/GlassCard';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookingMessages } from '@/components/bookings/BookingMessages';
import { useInbox } from '@/hooks/useInbox';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function InboxPage() {
  const { isRTL } = useLanguage();
  const {
    conversations,
    isLoading,
    activeConversation,
    activeMessages,
    setActiveConversation,
    sendMessage,
    markAsRead,
    totalUnread,
  } = useInbox();

  const Arrow = isRTL ? ArrowRight : ArrowLeft;

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-4 pb-32">
        <div>
          <h1 className={cn('text-2xl font-bold flex items-center gap-2', isRTL && 'font-arabic')}>
            <MessageSquare className="h-6 w-6 text-primary" />
            {isRTL ? 'الرسائل' : 'Messages'}
            {totalUnread > 0 && (
              <Badge variant="destructive" className="text-xs">{totalUnread}</Badge>
            )}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isRTL ? 'محادثاتك حول الحجوزات' : 'Your booking conversations'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[500px]">
          {/* Conversation List */}
          <GlassCard className={cn(
            'md:col-span-1',
            activeConversation && 'hidden md:block'
          )}>
            <GlassCardHeader className="pb-2">
              <CardTitle className="text-base">
                {isRTL ? 'المحادثات' : 'Conversations'}
              </CardTitle>
            </GlassCardHeader>
            <ScrollArea className="h-[450px]">
              {isLoading ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  {isRTL ? 'جارٍ التحميل...' : 'Loading...'}
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <Inbox className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <p className="font-medium text-muted-foreground">
                    {isRTL ? 'لا توجد رسائل بعد' : 'No messages yet'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isRTL ? 'ستظهر المحادثات هنا' : 'Conversations will appear here'}
                  </p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {conversations.map((conv, i) => (
                    <button
                      key={`${conv.booking_id}-${conv.other_user_id}`}
                      onClick={() => setActiveConversation(conv)}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-xl text-start transition-colors',
                        activeConversation?.other_user_id === conv.other_user_id &&
                        activeConversation?.booking_id === conv.booking_id
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-muted/50'
                      )}
                    >
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                          {conv.other_user_name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm truncate">
                            {conv.other_user_name}
                          </span>
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {format(new Date(conv.last_message_at), 'MMM d')}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {conv.last_message}
                        </p>
                        {conv.booking_id && (
                          <Badge variant="outline" className="text-[9px] mt-1 px-1.5 py-0">
                            {isRTL ? 'حجز' : 'Booking'}
                          </Badge>
                        )}
                      </div>
                      {conv.unread_count > 0 && (
                        <Badge variant="destructive" className="h-5 w-5 flex items-center justify-center p-0 text-[10px] shrink-0">
                          {conv.unread_count}
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </GlassCard>

          {/* Chat Panel */}
          <GlassCard className={cn(
            'md:col-span-2',
            !activeConversation && 'hidden md:flex md:items-center md:justify-center'
          )}>
            {activeConversation ? (
              <div className="h-full flex flex-col">
                {/* Mobile back button */}
                <div className="md:hidden p-2 border-b">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {/* reset active */ }}
                    className="gap-2"
                  >
                    <Arrow className="h-4 w-4" />
                    {isRTL ? 'رجوع' : 'Back'}
                  </Button>
                </div>
                <div className="flex-1">
                  <BookingMessages
                    messages={activeMessages}
                    recipientId={activeConversation.other_user_id}
                    recipientName={activeConversation.other_user_name || 'Unknown'}
                    onSendMessage={sendMessage}
                    onMarkAsRead={markAsRead}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center p-8">
                <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <p className="font-medium text-muted-foreground">
                  {isRTL ? 'اختر محادثة للبدء' : 'Select a conversation to start'}
                </p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
