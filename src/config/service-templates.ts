/**
 * Service Templates for Provider Onboarding
 * Pre-defined templates to help providers quickly create services
 */

import type { ServiceInclude } from '@/api/schemas/service.schema';

export interface ServiceTemplate {
  id: string;
  title: string;
  title_ar: string;
  description: string;
  description_ar: string;
  service_type: 'umrah' | 'hajj' | 'ziyarat';
  duration_days: number;
  includes: ServiceInclude[];
  suggested_price: number;
  icon: string;
}

export const SERVICE_TEMPLATES: ServiceTemplate[] = [
  {
    id: 'umrah_basic',
    title: 'Basic Umrah Package',
    title_ar: 'باقة العمرة الأساسية',
    description: 'Complete Umrah ritual performed on behalf of your loved one. Includes all essential rituals performed with care and devotion, documented with photos and videos.',
    description_ar: 'أداء العمرة الكاملة نيابة عن أحبائك. تشمل جميع المناسك الأساسية التي تُؤدى بعناية وإخلاص، وتوثق بالصور والفيديو.',
    service_type: 'umrah',
    duration_days: 1,
    includes: [
      { en: 'Complete Tawaf (7 rounds)', ar: 'طواف كامل (7 أشواط)' },
      { en: "Sa'i between Safa and Marwa", ar: 'سعي بين الصفا والمروة' },
      { en: 'Ihram from Miqat', ar: 'إحرام من الميقات' },
      { en: 'Dua for beneficiary', ar: 'دعاء للمستفيد' },
      { en: 'Photo/Video proof', ar: 'إثبات بالصور والفيديو' },
      { en: 'Certificate of completion', ar: 'شهادة إتمام العمرة' },
    ],
    suggested_price: 500,
    icon: '🕋',
  },
  {
    id: 'umrah_premium',
    title: 'Premium Umrah Package',
    title_ar: 'باقة العمرة المميزة',
    description: 'Enhanced Umrah service with additional prayers at Masjid al-Haram, Zamzam water delivery, and detailed video documentation of every ritual step.',
    description_ar: 'خدمة عمرة محسّنة مع صلوات إضافية في المسجد الحرام، توصيل ماء زمزم، وتوثيق فيديو تفصيلي لكل خطوة من المناسك.',
    service_type: 'umrah',
    duration_days: 1,
    includes: [
      { en: 'Complete Tawaf (7 rounds)', ar: 'طواف كامل (7 أشواط)' },
      { en: "Sa'i between Safa and Marwa", ar: 'سعي بين الصفا والمروة' },
      { en: 'Ihram from Miqat', ar: 'إحرام من الميقات' },
      { en: 'Extended Dua session', ar: 'جلسة دعاء مطولة' },
      { en: 'HD Video documentation', ar: 'توثيق فيديو عالي الجودة' },
      { en: 'Zamzam water (5L)', ar: 'ماء زمزم (5 لتر)' },
      { en: 'Prayers at Hijr Ismail', ar: 'صلاة في حجر إسماعيل' },
      { en: 'Certificate of completion', ar: 'شهادة إتمام العمرة' },
    ],
    suggested_price: 1200,
    icon: '⭐',
  },
  {
    id: 'hajj_badal',
    title: 'Hajj Badal (Proxy Hajj)',
    title_ar: 'حج بدل',
    description: 'Complete Hajj pilgrimage performed on behalf of a deceased person or someone unable to perform it themselves. All rituals performed according to Islamic guidelines.',
    description_ar: 'حج كامل يُؤدى نيابة عن متوفى أو شخص غير قادر على أدائه بنفسه. جميع المناسك تُؤدى وفق الإرشادات الإسلامية.',
    service_type: 'hajj',
    duration_days: 6,
    includes: [
      { en: 'Ihram from Miqat', ar: 'إحرام من الميقات' },
      { en: 'Day of Tarwiyah at Mina', ar: 'يوم التروية في منى' },
      { en: 'Wuquf at Arafat', ar: 'الوقوف بعرفة' },
      { en: 'Night at Muzdalifah', ar: 'المبيت بمزدلفة' },
      { en: 'Stoning of Jamarat', ar: 'رمي الجمرات' },
      { en: 'Sacrifice (Qurbani)', ar: 'الأضحية' },
      { en: 'Tawaf al-Ifadah', ar: 'طواف الإفاضة' },
      { en: "Sa'i", ar: 'السعي' },
      { en: 'Days of Tashreeq at Mina', ar: 'أيام التشريق في منى' },
      { en: 'Tawaf al-Wada', ar: 'طواف الوداع' },
      { en: 'Full documentation', ar: 'توثيق كامل' },
      { en: 'Certificate of completion', ar: 'شهادة إتمام الحج' },
    ],
    suggested_price: 8000,
    icon: '🏔️',
  },
  {
    id: 'ziyarat_madinah',
    title: 'Madinah Ziyarat Package',
    title_ar: 'باقة زيارة المدينة المنورة',
    description: 'Visit to Prophet\'s Mosque (Masjid an-Nabawi) with prayers and supplication on behalf of your loved one. Includes historical sites tour.',
    description_ar: "زيارة المسجد النبوي الشريف مع الصلاة والدعاء نيابة عن أحبائك. تشمل جولة في المواقع التاريخية.",
    service_type: 'ziyarat',
    duration_days: 2,
    includes: [
      { en: 'Prayers at Prophet\'s Mosque', ar: 'الصلاة في المسجد النبوي' },
      { en: 'Salam to the Prophet ﷺ', ar: 'السلام على النبي ﷺ' },
      { en: 'Visit to Rawdah (if possible)', ar: 'زيارة الروضة الشريفة (إن أمكن)' },
      { en: 'Visit to Jannat al-Baqi', ar: 'زيارة جنة البقيع' },
      { en: 'Masjid Quba visit', ar: 'زيارة مسجد قباء' },
      { en: 'Uhud mountain visit', ar: 'زيارة جبل أحد' },
      { en: 'Photo documentation', ar: 'توثيق بالصور' },
    ],
    suggested_price: 800,
    icon: '🕌',
  },
  {
    id: 'ziyarat_makkah',
    title: 'Makkah Holy Sites Tour',
    title_ar: 'جولة المواقع المقدسة بمكة',
    description: 'Comprehensive tour of historical Islamic sites in Makkah with prayers and duas at each location on behalf of your loved one.',
    description_ar: 'جولة شاملة للمواقع الإسلامية التاريخية في مكة مع الصلاة والدعاء في كل موقع نيابة عن أحبائك.',
    service_type: 'ziyarat',
    duration_days: 1,
    includes: [
      { en: 'Jabal al-Noor (Cave of Hira)', ar: 'جبل النور (غار حراء)' },
      { en: 'Jabal Thawr', ar: 'جبل ثور' },
      { en: 'Jannat al-Mualla', ar: 'جنة المعلاة' },
      { en: 'Birthplace of Prophet ﷺ', ar: 'مكان ولادة النبي ﷺ' },
      { en: 'Prayers at Masjid al-Haram', ar: 'الصلاة في المسجد الحرام' },
      { en: 'Full photo documentation', ar: 'توثيق كامل بالصور' },
    ],
    suggested_price: 600,
    icon: '⛰️',
  },
];

export function getTemplateById(id: string): ServiceTemplate | undefined {
  return SERVICE_TEMPLATES.find(t => t.id === id);
}

export function getTemplatesByType(type: 'umrah' | 'hajj' | 'ziyarat'): ServiceTemplate[] {
  return SERVICE_TEMPLATES.filter(t => t.service_type === type);
}
