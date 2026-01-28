import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { BookingWizard, type BookingData } from '@/components/booking/BookingWizard';
import { useBookings } from '@/hooks/useBookings';
import { useLanguage } from '@/lib/i18n';
import { format } from 'date-fns';

export default function NewBookingPage() {
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const { createBooking } = useBookings();

  const handleComplete = async (data: BookingData) => {
    if (!data.service || !data.beneficiary) return;

    // Secure booking creation - price is calculated server-side
    const booking = await createBooking({
      service_id: data.service.id,
      beneficiary_id: data.beneficiary.id,
      scheduled_date: data.scheduledDate ? format(data.scheduledDate, 'yyyy-MM-dd') : null,
      special_requests: data.specialRequests || null,
    });

    if (booking) {
      navigate('/dashboard');
    }
  };

  return (
    <MainLayout>
      <div className="container py-8 px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isRTL ? 'font-arabic' : ''}`}>
            {isRTL ? 'حجز جديد' : 'New Booking'}
          </h1>
          <p className="text-muted-foreground">
            {isRTL 
              ? 'اتبع الخطوات لإنشاء حجز جديد'
              : 'Follow the steps to create a new booking'}
          </p>
        </div>

        <BookingWizard onComplete={handleComplete} />
      </div>
    </MainLayout>
  );
}
