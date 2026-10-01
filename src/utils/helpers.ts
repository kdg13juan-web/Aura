import confetti from 'canvas-confetti';

export const generateId = (): string => {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
};

export const triggerConfetti = () => {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#6366f1', '#a855f7', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'],
      ticks: 200,
      gravity: 1.2,
      scalar: 1.1,
    });
  } catch {
    // Ignore if not supported
  }
};

// Date utilities
export const formatDateToISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTodayISO = (): string => {
  return formatDateToISO(new Date());
};

export const getRelativeDateISO = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return formatDateToISO(d);
};

export const formatDisplayDate = (isoDate: string): string => {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  const today = new Date();
  const todayISO = formatDateToISO(today);
  const tomorrowISO = getRelativeDateISO(1);
  const yesterdayISO = getRelativeDateISO(-1);

  if (isoDate === todayISO) return 'Hoy';
  if (isoDate === tomorrowISO) return 'Mañana';
  if (isoDate === yesterdayISO) return 'Ayer';

  return date.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
};

export const formatFullDateSpanish = (date: Date): string => {
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return '¡Buenos días!';
  if (hour >= 12 && hour < 19) return '¡Buenas tardes!';
  return '¡Buenas noches!';
};

export const getMonthMatrix = (year: number, month: number) => {
  // month is 0-indexed (0 = January)
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  // In Spanish, week starts on Monday (1). Sunday is 0 -> convert to 7 or shift
  let startDay = firstDayOfMonth.getDay();
  // 0 (Sunday) -> 6, 1 (Monday) -> 0, 2 (Tuesday) -> 1, etc.
  const startingCol = (startDay + 6) % 7;

  const totalDays = lastDayOfMonth.getDate();
  const matrix: { date: Date; iso: string; isCurrentMonth: boolean }[][] = [];
  
  let currentWeek: { date: Date; iso: string; isCurrentMonth: boolean }[] = [];
  
  // Previous month filler days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingCol - 1; i >= 0; i--) {
    const prevDate = new Date(year, month - 1, prevMonthLastDay - i);
    currentWeek.push({
      date: prevDate,
      iso: formatDateToISO(prevDate),
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let day = 1; day <= totalDays; day++) {
    const d = new Date(year, month, day);
    currentWeek.push({
      date: d,
      iso: formatDateToISO(d),
      isCurrentMonth: true,
    });

    if (currentWeek.length === 7) {
      matrix.push(currentWeek);
      currentWeek = [];
    }
  }

  // Next month filler days to complete last week
  if (currentWeek.length > 0) {
    let nextMonthDay = 1;
    while (currentWeek.length < 7) {
      const nextDate = new Date(year, month + 1, nextMonthDay++);
      currentWeek.push({
        date: nextDate,
        iso: formatDateToISO(nextDate),
        isCurrentMonth: false,
      });
    }
    matrix.push(currentWeek);
  }

  return matrix;
};

export const getDaysOfWeekSpanish = () => [
  'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'
];

export const getFullDaysOfWeekSpanish = () => [
  'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
];

export const getMonthsSpanish = () => [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];
