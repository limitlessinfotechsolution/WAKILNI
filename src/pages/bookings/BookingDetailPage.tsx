import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  ArrowRight,
  Calendar, 
  User, 
  DollarSign,
  CheckCircle,
  Clock,
  PlayCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Star,
  Download,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard, GlassCardContent } from '@/components/cards';
import { BookingTimeline } from '@/components/bookings/BookingTimeline';
import { BookingMessages } from '@/components/bookings/BookingMessages';
import { ProofGallery } from '@/components/bookings/ProofGallery';
import { ReviewForm } from '@/components/bookings/ReviewForm';
import { BottomSheet } from '@/components/navigation/BottomSheet';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { useBookingDetail, type BookingStatus } from '@/hooks/useBookingDetail';
import { useReviews } from '@/hooks/useReviews';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const statusConfig: Record<BookingStatus, { icon: typeof Clock; color: string; bgColor: string; label: { en: string; ar: string } }> = {
  pending: { 
    icon: Clock, 
    color: 'text-muted-foreground', 
    bgColor: 'bg-muted',
    label: { en: 'Pending', ar: 'معلق' }
  },
  accepted: { 
    icon: CheckCircle, 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    label: { en: 'Accepted', ar: 'مقبول' }
  },
  in_progress: { 
    icon: PlayCircle, 
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    label: { en: 'In Progress', ar: 'قيد التنفيذ' }
  },
  completed: { 
    icon: CheckCircle, 
    color: 'text-green-600', 
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    label: { en: 'Completed', ar: 'مكتمل' }
  },
  cancelled: { 
    icon: XCircle, 
    color: 'text-destructive', 
    bgColor: 'bg-destructive/10',
    label: { en: 'Cancelled', ar: 'ملغي' }
  },
  disputed: { 
    icon: AlertTriangle, 
    color: 'text-orange-600', 
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    label: { en: 'Disputed', ar: 'متنازع عليه' }
  },
};

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isRTL } = useLanguage();
  const { user, role } = useAuth();
  const [showActionsSheet, setShowActionsSheet] = useState(false);
  const { 
    booking, 
    activities, 
    messages, 
    isLoading, 
    updateStatus,
    sendMessage,
    uploadProof,
    markMessagesAsRead 
  } = useBookingDetail(id);
  
  const providerId = booking?.provider?.id;
  const { existingReview, submitReview } = useReviews(providerId, id);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!booking) {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-6">
          <GlassCard>
            <GlassCardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                {isRTL ? 'الحجز غير موجود' : 'Booking not found'}
              </p>
              <Button asChild className="rounded-xl">
                <Link to="/bookings">
                  {isRTL ? 'العودة للحجوزات' : 'Back to Bookings'}
                </Link>
              </Button>
            </GlassCardContent>
          </GlassCard>
        </div>
      </DashboardLayout>
    );
  }

  const status = (booking.status as BookingStatus) || 'pending';
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const isProvider = role === 'provider' && booking.provider?.user_id === user?.id;
  const isTraveler = booking.traveler_id === user?.id;
  const isAdmin = role === 'admin' || role === 'super_admin';

  const canUpdateStatus = isProvider || isAdmin;
  const canUploadProof = isProvider && status === 'in_progress';
  const canMessage = (isTraveler || isProvider) && booking.provider?.user_id;

  const recipientId = isTraveler 
    ? booking.provider?.user_id 
    : booking.traveler_id;

  const proofs = (booking.proof_gallery as any[]) || [];

  const handleStatusUpdate = async (newStatus: BookingStatus) => {
    await updateStatus(newStatus);
    setShowActionsSheet(false);
  };

  const Arrow = isRTL ? ArrowRight : ArrowLeft;

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="rounded-xl shrink-0">
            <Link to="/bookings">
              <Arrow className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className={cn("text-xl md:text-2xl font-bold truncate", isRTL && "font-arabic")}>
                {isRTL ? 'تفاصيل الحجز' : 'Booking Details'}
              </h1>
              <Badge className={cn(config.bgColor, config.color, "border-0 shrink-0")}>
                <StatusIcon className="h-3 w-3 me-1" />
                {config.label[isRTL ? 'ar' : 'en']}
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs md:text-sm">
              #{booking.id.slice(0, 8)}
            </p>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {status === 'completed' && (
              <Button variant="outline" size="icon" className="rounded-xl">
                <Download className="h-4 w-4" />
              </Button>
            )}
            <Button variant="outline" size="icon" className="rounded-xl">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Service Info */}
            <GlassCard variant="heavy">
              <CardHeader className="p-4 md:p-6 pb-2">
                <CardTitle className="text-lg">{booking.service?.title || 'Service'}</CardTitle>
                <CardDescription>
                  {booking.service?.description || (isRTL ? 'لا يوجد وصف' : 'No description')}
                </CardDescription>
              </CardHeader>
              <GlassCardContent className="p-4 md:p-6 pt-0 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50">
                    <Calendar className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">{isRTL ? 'الموعد' : 'Date'}</p>
                      <p className="text-sm font-medium">
                        {booking.scheduled_date 
                          ? format(new Date(booking.scheduled_date), 'PPP')
                          : (isRTL ? 'غير محدد' : 'Not scheduled')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50">
                    <DollarSign className="h-4 w-4 text-secondary" />
                    <div>
                      <p className="text-xs text-muted-foreground">{isRTL ? 'الإجمالي' : 'Total'}</p>
                      <p className="text-sm font-medium gradient-text-gold">
                        {booking.currency || 'SAR'} {booking.total_amount?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                </div>

                {booking.special_requests && (
                  <div className="p-3 rounded-xl bg-muted/50">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      {isRTL ? 'طلبات خاصة' : 'Special Requests'}
                    </p>
                    <p className="text-sm">{booking.special_requests}</p>
                  </div>
                )}
              </GlassCardContent>
            </GlassCard>

            {/* Tabs */}
            <Tabs defaultValue="timeline" className="w-full">
              <TabsList className="w-full rounded-xl bg-muted/50 p-1">
                <TabsTrigger value="timeline" className="flex-1 rounded-lg">
                  {isRTL ? 'الجدول' : 'Timeline'}
                </TabsTrigger>
                <TabsTrigger value="proofs" className="flex-1 rounded-lg">
                  {isRTL ? 'الإثباتات' : 'Proofs'} ({proofs.length})
                </TabsTrigger>
                {canMessage && recipientId && (
                  <TabsTrigger value="messages" className="flex-1 rounded-lg">
                    {isRTL ? 'الرسائل' : 'Messages'}
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="timeline" className="mt-4">
                <GlassCard>
                  <GlassCardContent className="p-4 md:p-6">
                    <BookingTimeline 
                      activities={activities} 
                      bookingCreatedAt={booking.created_at} 
                    />
                  </GlassCardContent>
                </GlassCard>
              </TabsContent>

              <TabsContent value="proofs" className="mt-4">
                <GlassCard>
                  <GlassCardContent className="p-4 md:p-6">
                    <ProofGallery
                      proofs={proofs}
                      canUpload={canUploadProof}
                      onUpload={uploadProof}
                    />
                  </GlassCardContent>
                </GlassCard>
              </TabsContent>

              {canMessage && recipientId && (
                <TabsContent value="messages" className="mt-4">
                  <BookingMessages
                    messages={messages}
                    recipientId={recipientId}
                    recipientName={
                      isTraveler 
                        ? (booking.provider?.company_name || 'Provider')
                        : 'Traveler'
                    }
                    onSendMessage={sendMessage}
                    onMarkAsRead={markMessagesAsRead}
                  />
                </TabsContent>
              )}
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 md:space-y-6">
            {/* Beneficiary Info */}
            {booking.beneficiary && (
              <GlassCard>
                <CardHeader className="p-4">
                  <CardTitle className="text-base">
                    {isRTL ? 'المستفيد' : 'Beneficiary'}
                  </CardTitle>
                </CardHeader>
                <GlassCardContent className="p-4 pt-0">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{booking.beneficiary.full_name}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {booking.beneficiary.status}
                      </p>
                    </div>
                  </div>
                </GlassCardContent>
              </GlassCard>
            )}

            {/* Provider Info */}
            {booking.provider && (
              <GlassCard>
                <CardHeader className="p-4">
                  <CardTitle className="text-base">
                    {isRTL ? 'مقدم الخدمة' : 'Provider'}
                  </CardTitle>
                </CardHeader>
                <GlassCardContent className="p-4 pt-0">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {booking.provider.company_name || 'Provider'}
                      </p>
                      {booking.provider.rating !== null && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                          <span className="text-sm text-muted-foreground">
                            {booking.provider.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </GlassCardContent>
              </GlassCard>
            )}

            {/* Status Actions */}
            {canUpdateStatus && status !== 'completed' && status !== 'cancelled' && (
              <GlassCard>
                <CardHeader className="p-4">
                  <CardTitle className="text-base">
                    {isRTL ? 'إجراءات' : 'Actions'}
                  </CardTitle>
                </CardHeader>
                <GlassCardContent className="p-4 pt-0 space-y-2">
                  {status === 'pending' && (
                    <>
                      <Button 
                        className="w-full rounded-xl btn-premium" 
                        onClick={() => handleStatusUpdate('accepted')}
                      >
                        {isRTL ? 'قبول الحجز' : 'Accept Booking'}
                      </Button>
                      <Button 
                        variant="destructive" 
                        className="w-full rounded-xl"
                        onClick={() => handleStatusUpdate('cancelled')}
                      >
                        {isRTL ? 'رفض الحجز' : 'Decline Booking'}
                      </Button>
                    </>
                  )}
                  {status === 'accepted' && (
                    <Button 
                      className="w-full rounded-xl btn-premium"
                      onClick={() => handleStatusUpdate('in_progress')}
                    >
                      {isRTL ? 'بدء الخدمة' : 'Start Service'}
                    </Button>
                  )}
                  {status === 'in_progress' && (
                    <Button 
                      className="w-full rounded-xl btn-premium"
                      onClick={() => handleStatusUpdate('completed')}
                    >
                      {isRTL ? 'إكمال الخدمة' : 'Complete Service'}
                    </Button>
                  )}
                </GlassCardContent>
              </GlassCard>
            )}

            {/* Review Section */}
            {status === 'completed' && isTraveler && booking.provider && !existingReview && (
              <ReviewForm
                onSubmit={(rating, comment, commentAr) => 
                  submitReview(rating, comment, commentAr)
                }
              />
            )}

            {existingReview && (
              <GlassCard>
                <CardHeader className="p-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                    {isRTL ? 'تقييمك' : 'Your Review'}
                  </CardTitle>
                </CardHeader>
                <GlassCardContent className="p-4 pt-0">
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          'h-4 w-4',
                          star <= existingReview.rating
                            ? 'fill-amber-500 text-amber-500'
                            : 'text-muted'
                        )}
                      />
                    ))}
                  </div>
                  {existingReview.comment && (
                    <p className="text-sm text-muted-foreground">
                      {existingReview.comment}
                    </p>
                  )}
                </GlassCardContent>
              </GlassCard>
            )}

            {/* Booking Dates */}
            <GlassCard>
              <CardHeader className="p-4">
                <CardTitle className="text-base">
                  {isRTL ? 'التواريخ' : 'Dates'}
                </CardTitle>
              </CardHeader>
              <GlassCardContent className="p-4 pt-0 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {isRTL ? 'تم الإنشاء' : 'Created'}
                  </span>
                  <span>{format(new Date(booking.created_at), 'PP')}</span>
                </div>
                {booking.scheduled_date && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {isRTL ? 'موعد الخدمة' : 'Scheduled'}
                    </span>
                    <span>{format(new Date(booking.scheduled_date), 'PP')}</span>
                  </div>
                )}
                {booking.completed_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {isRTL ? 'تم الإكمال' : 'Completed'}
                    </span>
                    <span>{format(new Date(booking.completed_at), 'PP')}</span>
                  </div>
                )}
              </GlassCardContent>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Mobile Actions Sheet */}
      <BottomSheet
        isOpen={showActionsSheet}
        onClose={() => setShowActionsSheet(false)}
        title={isRTL ? 'إجراءات الحجز' : 'Booking Actions'}
      >
        <div className="p-4 space-y-3">
          {status === 'pending' && (
            <>
              <Button 
                className="w-full rounded-xl" 
                onClick={() => handleStatusUpdate('accepted')}
              >
                {isRTL ? 'قبول الحجز' : 'Accept Booking'}
              </Button>
              <Button 
                variant="destructive" 
                className="w-full rounded-xl"
                onClick={() => handleStatusUpdate('cancelled')}
              >
                {isRTL ? 'رفض الحجز' : 'Decline Booking'}
              </Button>
            </>
          )}
        </div>
      </BottomSheet>
    </DashboardLayout>
  );
}
