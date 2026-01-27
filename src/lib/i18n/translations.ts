export type Language = 'en' | 'ar';

// Deep type for nested translation objects
type DeepStringRecord = {
  [key: string]: string | DeepStringRecord;
};

export interface TranslationSchema extends DeepStringRecord {
  brand: string;
  tagline: string;
  common: Record<string, string>;
  nav: Record<string, string>;
  auth: Record<string, string>;
  roles: Record<string, string>;
  services: Record<string, string>;
  bookings: Record<string, string>;
  beneficiaries: Record<string, string>;
  provider: Record<string, string>;
  admin: Record<string, string>;
  messages: Record<string, string>;
  footer: Record<string, string>;
  landing: Record<string, string>;
}

export const translations = {
  en: {
    // Brand
    brand: 'Wakilni',
    tagline: 'Proxy Pilgrimage Services',
    
    // Common
    common: {
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      search: 'Search',
      filter: 'Filter',
      submit: 'Submit',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      close: 'Close',
      yes: 'Yes',
      no: 'No',
      or: 'or',
      and: 'and',
      all: 'All',
      none: 'None',
      welcome: 'Welcome',
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Information',
    },
    
    // Navigation
    nav: {
      home: 'Home',
      dashboard: 'Dashboard',
      services: 'Services',
      bookings: 'My Bookings',
      beneficiaries: 'Beneficiaries',
      providers: 'Providers',
      messages: 'Messages',
      settings: 'Settings',
      profile: 'Profile',
      logout: 'Log Out',
      login: 'Log In',
      signup: 'Sign Up',
      admin: 'Admin',
    },
    
    // Auth
    auth: {
      login: 'Log In',
      signup: 'Create Account',
      logout: 'Log Out',
      email: 'Email Address',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      fullName: 'Full Name',
      phone: 'Phone Number',
      forgotPassword: 'Forgot Password?',
      resetPassword: 'Reset Password',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      signupAs: 'Sign up as',
      traveler: 'Traveler',
      provider: 'Service Provider',
      travelerDesc: 'Book proxy pilgrimage services for loved ones',
      providerDesc: 'Offer certified pilgrimage services',
      loginSuccess: 'Welcome back!',
      signupSuccess: 'Account created successfully!',
      logoutSuccess: 'Logged out successfully',
      invalidCredentials: 'Invalid email or password',
      emailRequired: 'Email is required',
      passwordRequired: 'Password is required',
      passwordMismatch: 'Passwords do not match',
      passwordTooShort: 'Password must be at least 8 characters',
      continueWithGoogle: 'Continue with Google',
      continueWithPhone: 'Continue with Phone',
      sendCode: 'Send Code',
      verifyCode: 'Verify Code',
      enterOtp: 'Enter the code sent to your phone',
    },
    
    // Roles
    roles: {
      admin: 'Administrator',
      traveler: 'Traveler',
      provider: 'Provider',
    },
    
    // Services
    services: {
      umrah: 'Umrah',
      hajj: 'Hajj',
      ziyarat: 'Ziyarat',
      allServices: 'All Services',
      bookNow: 'Book Now',
      viewDetails: 'View Details',
      price: 'Price',
      duration: 'Duration',
      days: 'days',
      includes: 'Includes',
      description: 'Description',
    },
    
    // Bookings
    bookings: {
      myBookings: 'My Bookings',
      newBooking: 'New Booking',
      bookingDetails: 'Booking Details',
      status: 'Status',
      pending: 'Pending',
      accepted: 'Accepted',
      inProgress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
      disputed: 'Disputed',
      scheduledDate: 'Scheduled Date',
      specialRequests: 'Special Requests',
      proofGallery: 'Proof Gallery',
      noBookings: 'No bookings yet',
      createFirst: 'Create your first booking',
    },
    
    // Beneficiaries
    beneficiaries: {
      title: 'Beneficiaries',
      addNew: 'Add Beneficiary',
      fullName: 'Full Name',
      dateOfBirth: 'Date of Birth',
      nationality: 'Nationality',
      status: 'Status',
      deceased: 'Deceased',
      sick: 'Sick',
      elderly: 'Elderly',
      disabled: 'Disabled',
      other: 'Other',
      statusNotes: 'Status Notes',
      documents: 'Documents',
      noBeneficiaries: 'No beneficiaries added',
      addFirst: 'Add your first beneficiary',
    },
    
    // Provider
    provider: {
      dashboard: 'Provider Dashboard',
      earnings: 'Earnings',
      rating: 'Rating',
      reviews: 'Reviews',
      completedBookings: 'Completed Bookings',
      pendingRequests: 'Pending Requests',
      kyc: 'Verification Status',
      kycPending: 'Pending Verification',
      kycUnderReview: 'Under Review',
      kycApproved: 'Verified',
      kycRejected: 'Verification Rejected',
      submitKyc: 'Submit for Verification',
      companyName: 'Company Name',
      bio: 'About',
      certifications: 'Certifications',
    },
    
    // Admin
    admin: {
      dashboard: 'Admin Dashboard',
      users: 'Users',
      providers: 'Providers',
      bookings: 'All Bookings',
      kycQueue: 'KYC Queue',
      analytics: 'Analytics',
      settings: 'Platform Settings',
      totalUsers: 'Total Users',
      totalProviders: 'Total Providers',
      totalBookings: 'Total Bookings',
      revenue: 'Revenue',
    },
    
    // Messages
    messages: {
      title: 'Messages',
      newMessage: 'New Message',
      noMessages: 'No messages',
      typeMessage: 'Type a message...',
      send: 'Send',
    },
    
    // Footer
    footer: {
      about: 'About Us',
      contact: 'Contact',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      faq: 'FAQ',
      copyright: '© 2024 Wakilni. All rights reserved.',
    },
    
    // Landing
    landing: {
      heroTitle: 'Fulfill Sacred Duties on Behalf of Loved Ones',
      heroSubtitle: 'Connect with certified providers to perform Umrah, Hajj, and Ziyarat for those who cannot travel',
      cta: 'Get Started',
      learnMore: 'Learn More',
      howItWorks: 'How It Works',
      step1Title: 'Choose a Service',
      step1Desc: 'Browse verified providers offering Umrah, Hajj, or Ziyarat services',
      step2Title: 'Add Beneficiary',
      step2Desc: 'Register the person on whose behalf the pilgrimage will be performed',
      step3Title: 'Book & Track',
      step3Desc: 'Complete booking and receive real-time updates with photo proof',
      trustedBy: 'Trusted by thousands of families worldwide',
    },
  },
  
  ar: {
    // Brand
    brand: 'وكّلني',
    tagline: 'خدمات الحج والعمرة بالنيابة',
    
    // Common
    common: {
      loading: 'جاري التحميل...',
      save: 'حفظ',
      cancel: 'إلغاء',
      delete: 'حذف',
      edit: 'تعديل',
      view: 'عرض',
      search: 'بحث',
      filter: 'تصفية',
      submit: 'إرسال',
      confirm: 'تأكيد',
      back: 'رجوع',
      next: 'التالي',
      previous: 'السابق',
      close: 'إغلاق',
      yes: 'نعم',
      no: 'لا',
      or: 'أو',
      and: 'و',
      all: 'الكل',
      none: 'لا شيء',
      welcome: 'مرحباً',
      success: 'نجاح',
      error: 'خطأ',
      warning: 'تحذير',
      info: 'معلومات',
    },
    
    // Navigation
    nav: {
      home: 'الرئيسية',
      dashboard: 'لوحة التحكم',
      services: 'الخدمات',
      bookings: 'حجوزاتي',
      beneficiaries: 'المستفيدون',
      providers: 'مقدمو الخدمات',
      messages: 'الرسائل',
      settings: 'الإعدادات',
      profile: 'الملف الشخصي',
      logout: 'تسجيل خروج',
      login: 'تسجيل دخول',
      signup: 'إنشاء حساب',
      admin: 'الإدارة',
    },
    
    // Auth
    auth: {
      login: 'تسجيل الدخول',
      signup: 'إنشاء حساب',
      logout: 'تسجيل الخروج',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      confirmPassword: 'تأكيد كلمة المرور',
      fullName: 'الاسم الكامل',
      phone: 'رقم الهاتف',
      forgotPassword: 'نسيت كلمة المرور؟',
      resetPassword: 'إعادة تعيين كلمة المرور',
      noAccount: 'ليس لديك حساب؟',
      hasAccount: 'لديك حساب بالفعل؟',
      signupAs: 'التسجيل كـ',
      traveler: 'مسافر',
      provider: 'مقدم خدمة',
      travelerDesc: 'احجز خدمات الحج والعمرة لأحبائك',
      providerDesc: 'قدم خدمات الحج والعمرة المعتمدة',
      loginSuccess: 'مرحباً بعودتك!',
      signupSuccess: 'تم إنشاء الحساب بنجاح!',
      logoutSuccess: 'تم تسجيل الخروج بنجاح',
      invalidCredentials: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
      emailRequired: 'البريد الإلكتروني مطلوب',
      passwordRequired: 'كلمة المرور مطلوبة',
      passwordMismatch: 'كلمات المرور غير متطابقة',
      passwordTooShort: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
      continueWithGoogle: 'المتابعة مع جوجل',
      continueWithPhone: 'المتابعة برقم الهاتف',
      sendCode: 'إرسال الرمز',
      verifyCode: 'تحقق من الرمز',
      enterOtp: 'أدخل الرمز المرسل إلى هاتفك',
    },
    
    // Roles
    roles: {
      admin: 'مدير',
      traveler: 'مسافر',
      provider: 'مقدم خدمة',
    },
    
    // Services
    services: {
      umrah: 'عمرة',
      hajj: 'حج',
      ziyarat: 'زيارة',
      allServices: 'جميع الخدمات',
      bookNow: 'احجز الآن',
      viewDetails: 'عرض التفاصيل',
      price: 'السعر',
      duration: 'المدة',
      days: 'أيام',
      includes: 'يشمل',
      description: 'الوصف',
    },
    
    // Bookings
    bookings: {
      myBookings: 'حجوزاتي',
      newBooking: 'حجز جديد',
      bookingDetails: 'تفاصيل الحجز',
      status: 'الحالة',
      pending: 'قيد الانتظار',
      accepted: 'مقبول',
      inProgress: 'قيد التنفيذ',
      completed: 'مكتمل',
      cancelled: 'ملغي',
      disputed: 'متنازع عليه',
      scheduledDate: 'التاريخ المحدد',
      specialRequests: 'طلبات خاصة',
      proofGallery: 'معرض الإثباتات',
      noBookings: 'لا توجد حجوزات بعد',
      createFirst: 'قم بإنشاء حجزك الأول',
    },
    
    // Beneficiaries
    beneficiaries: {
      title: 'المستفيدون',
      addNew: 'إضافة مستفيد',
      fullName: 'الاسم الكامل',
      dateOfBirth: 'تاريخ الميلاد',
      nationality: 'الجنسية',
      status: 'الحالة',
      deceased: 'متوفى',
      sick: 'مريض',
      elderly: 'كبير في السن',
      disabled: 'ذو إعاقة',
      other: 'أخرى',
      statusNotes: 'ملاحظات الحالة',
      documents: 'المستندات',
      noBeneficiaries: 'لم تتم إضافة مستفيدين',
      addFirst: 'أضف أول مستفيد',
    },
    
    // Provider
    provider: {
      dashboard: 'لوحة تحكم مقدم الخدمة',
      earnings: 'الأرباح',
      rating: 'التقييم',
      reviews: 'المراجعات',
      completedBookings: 'الحجوزات المكتملة',
      pendingRequests: 'الطلبات المعلقة',
      kyc: 'حالة التحقق',
      kycPending: 'في انتظار التحقق',
      kycUnderReview: 'قيد المراجعة',
      kycApproved: 'تم التحقق',
      kycRejected: 'تم رفض التحقق',
      submitKyc: 'تقديم للتحقق',
      companyName: 'اسم الشركة',
      bio: 'نبذة',
      certifications: 'الشهادات',
    },
    
    // Admin
    admin: {
      dashboard: 'لوحة تحكم المدير',
      users: 'المستخدمون',
      providers: 'مقدمو الخدمات',
      bookings: 'جميع الحجوزات',
      kycQueue: 'طابور التحقق',
      analytics: 'التحليلات',
      settings: 'إعدادات المنصة',
      totalUsers: 'إجمالي المستخدمين',
      totalProviders: 'إجمالي مقدمي الخدمات',
      totalBookings: 'إجمالي الحجوزات',
      revenue: 'الإيرادات',
    },
    
    // Messages
    messages: {
      title: 'الرسائل',
      newMessage: 'رسالة جديدة',
      noMessages: 'لا توجد رسائل',
      typeMessage: 'اكتب رسالة...',
      send: 'إرسال',
    },
    
    // Footer
    footer: {
      about: 'من نحن',
      contact: 'اتصل بنا',
      privacy: 'سياسة الخصوصية',
      terms: 'شروط الخدمة',
      faq: 'الأسئلة الشائعة',
      copyright: '© 2024 وكّلني. جميع الحقوق محفوظة.',
    },
    
    // Landing
    landing: {
      heroTitle: 'أدِّ الفريضة نيابةً عن أحبائك',
      heroSubtitle: 'تواصل مع مقدمي خدمات معتمدين لأداء العمرة والحج والزيارة لمن لا يستطيع السفر',
      cta: 'ابدأ الآن',
      learnMore: 'اعرف المزيد',
      howItWorks: 'كيف يعمل',
      step1Title: 'اختر الخدمة',
      step1Desc: 'تصفح مقدمي الخدمات المعتمدين للعمرة والحج والزيارة',
      step2Title: 'أضف المستفيد',
      step2Desc: 'سجّل الشخص الذي ستُؤدى عنه المناسك',
      step3Title: 'احجز وتابع',
      step3Desc: 'أكمل الحجز واحصل على تحديثات مباشرة مع صور الإثبات',
      trustedBy: 'موثوق من آلاف العائلات حول العالم',
    },
  },
} satisfies Record<Language, TranslationSchema>;

export type TranslationKeys = TranslationSchema;
