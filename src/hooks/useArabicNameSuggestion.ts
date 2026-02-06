import { useState, useCallback } from 'react';

// Common English-to-Arabic name mappings
const NAME_MAP: Record<string, string> = {
  // Common first names
  'mohammed': 'محمد', 'muhammad': 'محمد', 'mohamed': 'محمد', 'ahmad': 'أحمد', 'ahmed': 'أحمد',
  'ali': 'علي', 'omar': 'عمر', 'khalid': 'خالد', 'khaled': 'خالد', 'ibrahim': 'إبراهيم',
  'abdullah': 'عبدالله', 'abdulrahman': 'عبدالرحمن', 'abdelrahman': 'عبدالرحمن',
  'hassan': 'حسن', 'hussein': 'حسين', 'hussain': 'حسين', 'yusuf': 'يوسف', 'youssef': 'يوسف',
  'fatima': 'فاطمة', 'aisha': 'عائشة', 'ayesha': 'عائشة', 'mariam': 'مريم', 'maryam': 'مريم',
  'noor': 'نور', 'nour': 'نور', 'layla': 'ليلى', 'leila': 'ليلى', 'sara': 'سارة', 'sarah': 'سارة',
  'zainab': 'زينب', 'khadija': 'خديجة', 'amina': 'أمينة', 'hana': 'هناء', 'hanaa': 'هناء',
  'suleiman': 'سليمان', 'solomon': 'سليمان', 'mustafa': 'مصطفى', 'ismail': 'إسماعيل',
  'tariq': 'طارق', 'faisal': 'فيصل', 'salman': 'سلمان', 'sultan': 'سلطان', 'saad': 'سعد',
  'nasser': 'ناصر', 'rashid': 'راشد', 'hamad': 'حمد', 'turki': 'تركي', 'fahad': 'فهد',
  'waleed': 'وليد', 'walid': 'وليد', 'majed': 'ماجد', 'majid': 'ماجد', 'saud': 'سعود',
  'bandar': 'بندر', 'badr': 'بدر', 'mishaal': 'مشعل', 'nawaf': 'نواف', 'adel': 'عادل',
  'rania': 'رانيا', 'dina': 'دينا', 'dalal': 'دلال', 'huda': 'هدى', 'mona': 'منى',
  'noura': 'نورة', 'lama': 'لمى', 'reem': 'ريم', 'abeer': 'عبير', 'asma': 'أسماء',
  // Common last names / family names
  'al': 'آل', 'bin': 'بن', 'ibn': 'ابن', 'abu': 'أبو',
  'khan': 'خان', 'sheikh': 'شيخ', 'shaikh': 'شيخ',
  'sayed': 'سيد', 'saeed': 'سعيد', 'said': 'سعيد',
};

export function useArabicNameSuggestion() {
  const [suggestion, setSuggestion] = useState('');

  const suggestArabicName = useCallback((englishName: string): string => {
    if (!englishName.trim()) {
      setSuggestion('');
      return '';
    }

    const parts = englishName.trim().toLowerCase().split(/\s+/);
    const arabicParts: string[] = [];

    for (const part of parts) {
      const mapped = NAME_MAP[part];
      if (mapped) {
        arabicParts.push(mapped);
      }
    }

    const result = arabicParts.join(' ');
    setSuggestion(result);
    return result;
  }, []);

  return { suggestion, suggestArabicName };
}
