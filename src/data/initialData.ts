import type { 
  CategoryInfo, 
  AgendaEvent, 
  AgendaTask, 
  AgendaContact, 
  AgendaNote 
} from '../types/agenda';
import { getRelativeDateISO, getTodayISO } from '../utils/helpers';

export const CATEGORIES: Record<string, CategoryInfo> = {
  trabajo: {
    id: 'trabajo',
    label: 'Trabajo',
    color: '#6366f1', // Indigo
    bgLight: 'rgba(99, 102, 241, 0.12)',
    bgDark: 'rgba(99, 102, 241, 0.22)',
    borderColor: 'rgba(99, 102, 241, 0.4)',
    iconName: 'Briefcase',
  },
  personal: {
    id: 'personal',
    label: 'Personal',
    color: '#10b981', // Emerald
    bgLight: 'rgba(16, 185, 129, 0.12)',
    bgDark: 'rgba(16, 185, 129, 0.22)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
    iconName: 'User',
  },
  salud: {
    id: 'salud',
    label: 'Salud & Deporte',
    color: '#06b6d4', // Cyan
    bgLight: 'rgba(6, 182, 212, 0.12)',
    bgDark: 'rgba(6, 182, 212, 0.22)',
    borderColor: 'rgba(6, 182, 212, 0.4)',
    iconName: 'HeartPulse',
  },
  estudio: {
    id: 'estudio',
    label: 'Estudio & Aprendizaje',
    color: '#f59e0b', // Amber
    bgLight: 'rgba(245, 158, 11, 0.12)',
    bgDark: 'rgba(245, 158, 11, 0.22)',
    borderColor: 'rgba(245, 158, 11, 0.4)',
    iconName: 'GraduationCap',
  },
  finanzas: {
    id: 'finanzas',
    label: 'Finanzas',
    color: '#84cc16', // Lime
    bgLight: 'rgba(132, 204, 22, 0.12)',
    bgDark: 'rgba(132, 204, 22, 0.22)',
    borderColor: 'rgba(132, 204, 22, 0.4)',
    iconName: 'DollarSign',
  },
  reunion: {
    id: 'reunion',
    label: 'Reunión',
    color: '#a855f7', // Purple
    bgLight: 'rgba(168, 85, 247, 0.12)',
    bgDark: 'rgba(168, 85, 247, 0.22)',
    borderColor: 'rgba(168, 85, 247, 0.4)',
    iconName: 'Users',
  },
  urgente: {
    id: 'urgente',
    label: 'Urgente',
    color: '#f43f5e', // Rose
    bgLight: 'rgba(244, 63, 94, 0.15)',
    bgDark: 'rgba(244, 63, 94, 0.25)',
    borderColor: 'rgba(244, 63, 94, 0.5)',
    iconName: 'AlertCircle',
  },
};

export const INITIAL_CONTACTS: AgendaContact[] = [
  {
    id: 'cont-1',
    name: 'Dra. Valentina Ramos',
    email: 'valentina.ramos@medcare.com',
    phone: '+34 612 345 678',
    company: 'Centro Médico Quirúrgico',
    role: 'Médico Especialista',
    category: 'salud',
    notes: 'Revisión anual y seguimiento general.',
    favorite: true,
    avatarColor: '#06b6d4',
    createdAt: '2026-01-10',
  },
  {
    id: 'cont-2',
    name: 'Carlos Mendoza',
    email: 'cmendoza@techsolutions.io',
    phone: '+34 689 452 110',
    company: 'Tech Solutions Global',
    role: 'Director de Proyecto',
    category: 'trabajo',
    notes: 'Coordinador del proyecto de migración cloud.',
    favorite: true,
    avatarColor: '#6366f1',
    createdAt: '2026-01-15',
  },
  {
    id: 'cont-3',
    name: 'Elena Gómez',
    email: 'elena.gomez@designlab.es',
    phone: '+34 655 789 012',
    company: 'DesignLab Studio',
    role: 'Lead UI/UX Designer',
    category: 'reunion',
    notes: 'Revisión de prototipos y sistema de diseño.',
    favorite: false,
    avatarColor: '#a855f7',
    createdAt: '2026-02-01',
  },
  {
    id: 'cont-4',
    name: 'Lucía Fernández',
    email: 'lucia.f@gmail.com',
    phone: '+34 633 112 233',
    company: 'Amigos & Familia',
    role: 'Hermana',
    category: 'personal',
    notes: 'Cumpleaños el 15 de Noviembre.',
    favorite: true,
    avatarColor: '#10b981',
    createdAt: '2026-02-10',
  },
  {
    id: 'cont-5',
    name: 'Marcos Herrera',
    email: 'mherrera@bbva-asesores.com',
    phone: '+34 670 998 844',
    company: 'Asesoría Financiera',
    role: 'Consultor Patrimonial',
    category: 'finanzas',
    notes: 'Planificación fiscal y fondos de inversión.',
    favorite: false,
    avatarColor: '#84cc16',
    createdAt: '2026-02-20',
  },
];

export const getInitialEvents = (): AgendaEvent[] => {
  const today = getTodayISO();
  const tomorrow = getRelativeDateISO(1);
  const inTwoDays = getRelativeDateISO(2);
  const inFiveDays = getRelativeDateISO(5);
  const yesterday = getRelativeDateISO(-1);

  return [
    {
      id: 'ev-1',
      title: 'Planificación de Sprint & Objetivos',
      description: 'Revisión de metas semanales con el equipo técnico y asignación de prioridades.',
      date: today,
      startTime: '09:30',
      endTime: '10:30',
      category: 'trabajo',
      location: 'Sala de Conferencias A / Google Meet',
      meetLink: 'https://meet.google.com/abc-defg-hij',
      contactId: 'cont-2',
      reminderMinutes: 15,
    },
    {
      id: 'ev-2',
      title: 'Sesión de Entrenamiento Funcional',
      description: 'Rutina de fuerza y 30 minutos de cardio en el gimnasio.',
      date: today,
      startTime: '13:00',
      endTime: '14:00',
      category: 'salud',
      location: 'FitCenter Gym',
      reminderMinutes: 30,
    },
    {
      id: 'ev-3',
      title: 'Revisión de Diseño UI con Elena',
      description: 'Feedback de la nueva interfaz de la aplicación de agenda y componentes.',
      date: today,
      startTime: '16:00',
      endTime: '17:00',
      category: 'reunion',
      location: 'Figma / Zoom Call',
      meetLink: 'https://zoom.us/j/123456789',
      contactId: 'cont-3',
      reminderMinutes: 10,
    },
    {
      id: 'ev-4',
      title: 'Chequeo Médico Periódico',
      description: 'Consulta con la Dra. Valentina Ramos para análisis rutinarios.',
      date: tomorrow,
      startTime: '11:00',
      endTime: '12:00',
      category: 'salud',
      location: 'Centro Médico Quirúrgico - Consulta 304',
      contactId: 'cont-1',
      reminderMinutes: 60,
    },
    {
      id: 'ev-5',
      title: 'Webinar: Arquitectura Cloud & React 19',
      description: 'Clase magistral sobre rendimiento y patrones modernos de desarrollo frontend.',
      date: inTwoDays,
      startTime: '18:30',
      endTime: '20:00',
      category: 'estudio',
      location: 'Plataforma Online',
      meetLink: 'https://youtube.com/live/example',
      reminderMinutes: 30,
    },
    {
      id: 'ev-6',
      title: 'Cena Familiar de Cumpleaños',
      description: 'Celebración familiar en restaurante La Terraza.',
      date: inFiveDays,
      startTime: '21:00',
      endTime: '23:30',
      category: 'personal',
      location: 'Restaurante La Terraza',
      contactId: 'cont-4',
    },
    {
      id: 'ev-7',
      title: 'Revisión de Cierre Mensual',
      description: 'Auditoría de gastos y facturas del mes.',
      date: yesterday,
      startTime: '17:00',
      endTime: '18:00',
      category: 'finanzas',
      completed: true,
    },
  ];
};

export const getInitialTasks = (): AgendaTask[] => {
  const today = getTodayISO();
  const tomorrow = getRelativeDateISO(1);
  const inThreeDays = getRelativeDateISO(3);
  const yesterday = getRelativeDateISO(-1);

  return [
    {
      id: 'task-1',
      title: 'Finalizar informe de métricas trimestrales',
      description: 'Consolidar datos de ventas, conversión y crecimiento del equipo.',
      dueDate: today,
      dueTime: '18:00',
      priority: 'alta',
      category: 'trabajo',
      completed: false,
      contactId: 'cont-2',
      subtasks: [
        { id: 'sub-1', title: 'Exportar analíticas de Google y Mixpanel', completed: true },
        { id: 'sub-2', title: 'Crear gráficos comparativos', completed: true },
        { id: 'sub-3', title: 'Redactar conclusiones y próximos pasos', completed: false },
      ],
    },
    {
      id: 'task-2',
      title: 'Comprar regalo de cumpleaños para Lucía',
      description: 'Buscar un libro de fotografía o unos auriculares inalámbricos.',
      dueDate: today,
      dueTime: '20:00',
      priority: 'media',
      category: 'personal',
      completed: false,
      contactId: 'cont-4',
      subtasks: [
        { id: 'sub-4', title: 'Ver opciones en tienda online', completed: true },
        { id: 'sub-5', title: 'Confirmar dirección de envío', completed: false },
      ],
    },
    {
      id: 'task-3',
      title: 'Pagar factura de suministros e internet',
      description: 'Verificar débito automático y descargar recibo bancario.',
      dueDate: tomorrow,
      dueTime: '12:00',
      priority: 'critica',
      category: 'finanzas',
      completed: false,
      subtasks: [],
    },
    {
      id: 'task-4',
      title: 'Completar Módulo 4 de TypeScript Avanzado',
      description: 'Ejercicios prácticos sobre genéricos y tipos condicionales.',
      dueDate: inThreeDays,
      priority: 'media',
      category: 'estudio',
      completed: false,
      subtasks: [
        { id: 'sub-6', title: 'Ver videos 1 al 5', completed: false },
        { id: 'sub-7', title: 'Resolver desafío de código', completed: false },
      ],
    },
    {
      id: 'task-5',
      title: 'Comprar frutas y suplementos deportivos',
      dueDate: yesterday,
      priority: 'baja',
      category: 'salud',
      completed: true,
      completedAt: yesterday,
      subtasks: [],
    },
  ];
};

export const INITIAL_NOTES: AgendaNote[] = [
  {
    id: 'note-1',
    title: '💡 Ideas para el nuevo proyecto',
    content: '1. Integrar modo offline con IndexedDB.\n2. Añadir comandos rápidos con Ctrl+K.\n3. Soporte para arrastrar y soltar tareas.\n4. Exportación en PDF con diseño limpio.',
    color: 'lavender',
    category: 'trabajo',
    pinned: true,
    tags: ['features', 'roadmap', '2026'],
    updatedAt: 'Hace 2 horas',
  },
  {
    id: 'note-2',
    title: '🥗 Plan Nutricional e Hidratación',
    content: '• Tomar al menos 2.5L de agua al día.\n• Desayuno: Avena con fruta y frutos secos.\n• Merienda: Yogur griego o proteína.\n• Reducir azúcares refinados entre semana.',
    color: 'emerald',
    category: 'salud',
    pinned: true,
    tags: ['hábitos', 'bienestar'],
    updatedAt: 'Ayer',
  },
  {
    id: 'note-3',
    title: '📚 Libros recomendados para leer',
    content: '• Atomic Habits - James Clear\n• Deep Work - Cal Newport\n• Designing Data-Intensive Applications\n• The Psychology of Money - Morgan Housel',
    color: 'amber',
    category: 'estudio',
    pinned: false,
    tags: ['lectura', 'productividad'],
    updatedAt: 'Hace 3 días',
  },
  {
    id: 'note-4',
    title: '✈️ Lista de equipaje - Escapada fin de semana',
    content: '• Pasaporte / DNI\n• Cargador portátil y adaptadores\n• Ropa cómoda y cortavientos\n• Kit de aseo y protector solar',
    color: 'sky',
    category: 'personal',
    pinned: false,
    tags: ['viajes', 'checklist'],
    updatedAt: 'Hace 5 días',
  },
];
