// dashboard.component.ts - Versión mejorada
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Subject, takeUntil, interval } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';
import { HabitosRecomendadosComponent, HabitoRecomendado } from './habitos-recomendados/habitos-recomendados.component';
import { MotivacionComponent } from './motivacion/motivacion.component';

type CategoryType = 'health' | 'exercise' | 'nutrition' | 'meditation' | 'sleep' | 'other';
type TimeOfDay = 'morning' | 'afternoon' | 'evening';

interface HabitSchedule {
  id: string;
  time?: string; // OPCIONAL: formato HH:mm
  timeOfDay: TimeOfDay;
  notificationEnabled: boolean; // Solo notificaciones, sin "enabled"
}

interface Activity {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  customDays?: number[];
  customDayOfMonth?: number;
  category: CategoryType;
  streak: number;
  lastCompletedDate?: Date;
  completionHistory: Date[]; // Una entrada por día completado
  schedules: HabitSchedule[];
  isEditing?: boolean;
}

interface CategoryInfo {
  value: CategoryType;
  name: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, HabitosRecomendadosComponent, MotivacionComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(-20px)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private notificationCheckInterval$ = interval(60000); // Revisar cada minuto
  
  userName: string = '';
  currentDate = new Date();
  greeting: string = '';
  
  activities: Activity[] = [];
  showAddActivity = false;
  
  // Formulario para nueva actividad
  newActivity = {
    title: '',
    description: '',
    category: 'health' as CategoryType,
    frequency: 'daily' as 'daily' | 'weekly' | 'monthly' | 'custom',
    customDays: [] as number[],
    customDayOfMonth: 1,
    schedules: [] as Omit<HabitSchedule, 'id'>[]
  };

  // Estados para edición
  editingActivity: Activity | null = null;
  editForm = { ...this.newActivity };

  // Estadísticas
  stats = {
    totalActivities: 0,
    completedToday: 0,
    currentStreak: 0,
    completionRate: 0
  };

  // Categorías disponibles
  categories: CategoryInfo[] = [
    { value: 'health', name: 'Salud', icon: '🏥', color: '#4CAF50' },
    { value: 'exercise', name: 'Ejercicio', icon: '💪', color: '#2196F3' },
    { value: 'nutrition', name: 'Nutrición', icon: '🥗', color: '#FF9800' },
    { value: 'meditation', name: 'Meditación', icon: '🧘', color: '#9C27B0' },
    { value: 'sleep', name: 'Sueño', icon: '😴', color: '#3F51B5' },
    { value: 'other', name: 'Otro', icon: '📌', color: '#607D8B' }
  ];

  // Días de la semana
  weekDays = [
    { value: 1, name: 'Lunes' },
    { value: 2, name: 'Martes' },
    { value: 3, name: 'Miércoles' },
    { value: 4, name: 'Jueves' },
    { value: 5, name: 'Viernes' },
    { value: 6, name: 'Sábado' },
    { value: 0, name: 'Domingo' }
  ];

  // Períodos del día
  timeOfDayPeriods = [
    { value: 'morning' as TimeOfDay, name: 'Mañana', icon: '🌅', timeRange: '06:00-12:00' },
    { value: 'afternoon' as TimeOfDay, name: 'Tarde', icon: '☀️', timeRange: '12:01-18:00' },
    { value: 'evening' as TimeOfDay, name: 'Noche', icon: '🌙', timeRange: '18:01-23:59' }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.initializeNotifications();
    this.loadUserData();
    this.loadActivities();
    this.updateStats();
    this.setGreeting();
    
    // Iniciar verificación de notificaciones
    this.notificationCheckInterval$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.checkScheduledNotifications());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ========== GESTIÓN DE NOTIFICACIONES ==========
  
  async initializeNotifications() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      console.log('Permiso de notificaciones:', permission);
    }
  }

  checkScheduledNotifications() {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    this.activities.forEach(activity => {
      activity.schedules.forEach(schedule => {
        if (schedule.enabled && schedule.notificationEnabled && schedule.time === currentTime) {
          this.sendNotification(activity, schedule);
        }
      });
    });
  }

  sendNotification(activity: Activity, schedule: HabitSchedule) {
    if (Notification.permission === 'granted') {
      const timeOfDayText = this.timeOfDayPeriods.find(p => p.value === schedule.timeOfDay)?.name || '';
      
      new Notification(`🔔 Recordatorio: ${activity.title}`, {
        body: `Es hora de ${activity.title.toLowerCase()} - ${timeOfDayText} (${schedule.time})`,
        icon: '/assets/icon-192x192.png',
        badge: '/assets/icon-192x192.png',
        requireInteraction: true
        // Removido 'actions' porque no es compatible con todos los navegadores
      });
    }
  }

  // ========== GESTIÓN DE ACTIVIDADES ==========

  saveActivities() {
    localStorage.setItem('bienestar-activities', JSON.stringify(this.activities));
    this.updateStats();
  }

  addActivity() {
    if (!this.newActivity.title.trim()) return;

    const activity: Activity = {
      id: Date.now().toString(),
      title: this.newActivity.title,
      description: this.newActivity.description,
      completed: false,
      createdAt: new Date(),
      frequency: this.newActivity.frequency,
      customDays: [...this.newActivity.customDays],
      customDayOfMonth: this.newActivity.customDayOfMonth,
      category: this.newActivity.category,
      streak: 0,
      completionHistory: [],
      schedules: this.newActivity.schedules.map(s => ({
        id: Date.now().toString() + Math.random(),
        ...s
      })),
      scheduleCompletions: {}, // NUEVO: inicializar completados por horario
      isEditing: false
    };

    this.activities.push(activity);
    this.saveActivities();
    this.resetForm();
    this.showAddActivity = false;
  }

  // ========== EDICIÓN DE ACTIVIDADES ==========

  startEditActivity(activity: Activity) {
    this.editingActivity = activity;
    this.editForm = {
      title: activity.title,
      description: activity.description || '',
      category: activity.category,
      frequency: activity.frequency,
      customDays: [...(activity.customDays || [])],
      customDayOfMonth: activity.customDayOfMonth || 1,
      schedules: activity.schedules.map(s => ({
        time: s.time || '',
        timeOfDay: s.timeOfDay,
        notificationEnabled: s.notificationEnabled
      }))
    };
    activity.isEditing = true;
  }
    if (!this.editingActivity || !this.editForm.title.trim()) return;

    this.editingActivity.title = this.editForm.title;
    this.editingActivity.description = this.editForm.description;
    this.editingActivity.category = this.editForm.category;
    this.editingActivity.frequency = this.editForm.frequency;
    this.editingActivity.customDays = [...this.editForm.customDays];
    this.editingActivity.customDayOfMonth = this.editForm.customDayOfMonth;
    this.editingActivity.schedules = this.editForm.schedules.map(s => ({
      id: Date.now().toString() + Math.random(),
      time: s.time || undefined,
      timeOfDay: s.timeOfDay,
      notificationEnabled: s.notificationEnabled
    }));
    this.editingActivity.isEditing = false;

    this.saveActivities();
    this.editingActivity = null;
  }

  cancelEditActivity() {
    if (this.editingActivity) {
      this.editingActivity.isEditing = false;
      this.editingActivity = null;
    }
  }

  deleteActivity(activity: Activity) {
    if (confirm(`¿Estás seguro de que quieres eliminar "${activity.title}"?`)) {
      this.activities = this.activities.filter(a => a.id !== activity.id);
      this.saveActivities();
    }
  }

  // ========== ORGANIZACIÓN POR HORARIOS ==========

  getActivitiesByTimeOfDay(timeOfDay: TimeOfDay): Activity[] {
    return this.activities.filter(activity => 
      activity.schedules.some(schedule => 
        schedule.timeOfDay === timeOfDay && schedule.enabled
      )
    );
  }

  getCurrentTimeOfDay(): TimeOfDay {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    return 'evening';
  }

  getNextScheduleForActivity(activity: Activity): HabitSchedule | null {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const todaySchedules = activity.schedules
      .filter(s => s.enabled)
      .map(s => {
        const [hours, minutes] = s.time.split(':').map(Number);
        return { ...s, totalMinutes: hours * 60 + minutes };
      })
      .filter(s => s.totalMinutes > currentTime)
      .sort((a, b) => a.totalMinutes - b.totalMinutes);

    return todaySchedules.length > 0 ? todaySchedules[0] : null;
  }

  // ========== COMPLETAR ACTIVIDADES SIMPLIFICADO ==========

  toggleActivityToday(activity: Activity) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (activity.completed) {
      // Desmarcar - quitar del historial de hoy
      activity.completed = false;
      activity.completedAt = undefined;
      activity.completionHistory = activity.completionHistory.filter(date => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() !== today.getTime();
      });
    } else {
      // Marcar como completado
      activity.completed = true;
      activity.completedAt = new Date();
      activity.lastCompletedDate = new Date();
      
      // Agregar al historial si no existe
      const hasCompletionToday = activity.completionHistory.some(date => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
      });
      
      if (!hasCompletionToday) {
        activity.completionHistory.push(new Date());
      }
      
      // Actualizar racha
      this.updateStreak(activity);
    }
    
    this.saveActivities();
  }

  isActivityCompletedToday(activity: Activity): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return activity.completionHistory.some(date => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });
  }

  // ========== GESTIÓN DE HORARIOS ==========

  removeScheduleFromForm(index: number) {
    this.newActivity.schedules.splice(index, 1);
  }

  // ========== GESTIÓN DE HORARIOS MEJORADA ==========

  getCurrentTimeOfDay(): TimeOfDay {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    return 'evening'; // 18:00 - 5:59
  }

  getActivitiesByTimeOfDay(timeOfDay: TimeOfDay): Activity[] {
    return this.activities.filter(activity => 
      activity.schedules.some(schedule => schedule.timeOfDay === timeOfDay)
    );
  }

  getActiveSchedulesForPeriod(activity: Activity, timeOfDay: TimeOfDay): HabitSchedule[] {
    return activity.schedules.filter(schedule => schedule.timeOfDay === timeOfDay);
  }

  getPeriodDisplayName(timeOfDay: TimeOfDay): string {
    const periods = {
      'morning': 'Mañana',
      'afternoon': 'Tarde', 
      'evening': 'Noche'
    };
    return periods[timeOfDay] || '';
  }

  getTimeOfDayText(timeOfDay: TimeOfDay): string {
    const texts = {
      'morning': '🌅 Mañana (06:00-12:00)',
      'afternoon': '☀️ Tarde (12:01-18:00)',
      'evening': '🌙 Noche (18:01-23:59)'
    };
    return texts[timeOfDay] || '';
  }

  // ========== GESTIÓN DE FORMULARIOS SIMPLIFICADA ==========

  setScheduleType(schedule: any, type: 'time' | 'period') {
    if (type === 'time') {
      schedule.time = '08:00'; // Hora por defecto
      this.updateScheduleTimeOfDay(schedule, schedule.time);
    } else {
      schedule.time = ''; // Sin hora específica
      schedule.timeOfDay = 'morning'; // Período por defecto
    }
  }

  setEditScheduleType(schedule: any, type: 'time' | 'period') {
    if (type === 'time') {
      schedule.time = '08:00';
      this.updateScheduleTimeOfDay(schedule, schedule.time);
    } else {
      schedule.time = '';
      schedule.timeOfDay = 'morning';
    }
  }  // ========== UTILIDADES ==========

  resetForm() {
    this.newActivity = {
      title: '',
      description: '',
      category: 'health',
      frequency: 'daily',
      customDays: [],
      customDayOfMonth: 1,
      schedules: []
    };
  }

  updateStats() {
    this.stats.totalActivities = this.activities.length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    this.stats.completedToday = this.activities.filter(activity => 
      activity.completionHistory.some(date => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
      })
    ).length;
    
    this.stats.completionRate = this.stats.totalActivities > 0 
      ? Math.round((this.stats.completedToday / this.stats.totalActivities) * 100)
      : 0;
    
    this.stats.currentStreak = this.activities.length > 0 
      ? Math.max(...this.activities.map(a => a.streak || 0))
      : 0;
  }

  setGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) {
      this.greeting = '¡Buenos días';
    } else if (hour < 18) {
      this.greeting = '¡Buenas tardes';
    } else {
      this.greeting = '¡Buenas noches';
    }
  }

  loadUserData() {
    this.authService.currentUser$.subscribe((user: any) => {
      if (user) {
        this.userName = user.email?.split('@')[0] || 'Usuario';
      }
    });
  }

  shouldShowMotivation(): boolean {
    const ahora = new Date();
    const horaActual = ahora.getHours();
    
    if (this.stats.totalActivities === 0) return true;
    if (horaActual >= 12 && this.stats.completionRate < 25) return true;
    if (horaActual >= 15 && this.stats.completionRate < 50) return true;
    if (horaActual >= 18 && this.stats.completionRate < 75) return true;
    if (this.stats.currentStreak < 3 && this.stats.totalActivities > 0) return true;
    
    return false;
  }

  getCategoryInfo(category: string): CategoryInfo {
    return this.categories.find(c => c.value === category) || this.categories[5];
  }

  getFrequencyText(activity: Activity): string {
    switch (activity.frequency) {
      case 'daily': return 'Diario';
      case 'weekly': return 'Semanal';
      case 'monthly': return `Día ${activity.customDayOfMonth} de cada mes`;
      case 'custom':
        const days = activity.customDays?.map(d => 
          this.weekDays.find(wd => wd.value === d)?.name
        ).filter(Boolean).join(', ');
        return days || 'Personalizado';
      default: return '';
    }
  }

  updateStreak(activity: Activity) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let checkDate = new Date(today);
    
    while (true) {
      const hasCompletion = activity.completionHistory.some(date => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === checkDate.getTime();
      });
      
      if (hasCompletion) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    activity.streak = streak;
  }

  // ========== UTILIDADES ==========

  resetForm() {
    this.newActivity = {
      title: '',
      description: '',
      category: 'health',
      frequency: 'daily',
      customDays: [],
      customDayOfMonth: 1,
      schedules: []
    };
  }

  updateStats() {
    this.stats.totalActivities = this.activities.length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    this.stats.completedToday = this.activities.filter(activity => 
      activity.completionHistory.some(date => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
      })
    ).length;
    
    this.stats.completionRate = this.stats.totalActivities > 0 
      ? Math.round((this.stats.completedToday / this.stats.totalActivities) * 100)
      : 0;
    
    this.stats.currentStreak = this.activities.length > 0 
      ? Math.max(...this.activities.map(a => a.streak || 0))
      : 0;
  }

  setGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) {
      this.greeting = '¡Buenos días';
    } else if (hour < 18) {
      this.greeting = '¡Buenas tardes';
    } else {
      this.greeting = '¡Buenas noches';
    }
  }

  loadUserData() {
    this.authService.currentUser$.subscribe((user: any) => {
      if (user) {
        this.userName = user.email?.split('@')[0] || 'Usuario';
      }
    });
  }

  shouldShowMotivation(): boolean {
    const ahora = new Date();
    const horaActual = ahora.getHours();
    
    if (this.stats.totalActivities === 0) return true;
    if (horaActual >= 12 && this.stats.completionRate < 25) return true;
    if (horaActual >= 15 && this.stats.completionRate < 50) return true;
    if (horaActual >= 18 && this.stats.completionRate < 75) return true;
    if (this.stats.currentStreak < 3 && this.stats.totalActivities > 0) return true;
    
    return false;
  }

  getCategoryInfo(category: string): CategoryInfo {
    return this.categories.find(c => c.value === category) || this.categories[5];
  }

  updateStreak(activity: Activity) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let checkDate = new Date(today);
    
    while (true) {
      const hasCompletion = activity.completionHistory.some(date => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === checkDate.getTime();
      });
      
      if (hasCompletion) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    activity.streak = streak;
  }

  // Método para manejar días personalizados en formulario nuevo
  toggleCustomDay(event: any, dayValue: number) {
    const isChecked = event.target.checked;
    if (isChecked) {
      if (!this.newActivity.customDays.includes(dayValue)) {
        this.newActivity.customDays.push(dayValue);
      }
    } else {
      this.newActivity.customDays = this.newActivity.customDays.filter(d => d !== dayValue);
    }
  }

  // Método para manejar días personalizados en formulario de edición
  toggleEditCustomDay(event: any, dayValue: number) {
    const isChecked = event.target.checked;
    if (isChecked) {
      if (!this.editForm.customDays.includes(dayValue)) {
        this.editForm.customDays.push(dayValue);
      }
    } else {
      this.editForm.customDays = this.editForm.customDays.filter(d => d !== dayValue);
    }
  }

  // Método para trackBy en ngFor
  trackByActivityId(index: number, activity: Activity): string {
    return activity.id;
  }

  onRecommendedHabitAdded(habito: HabitoRecomendado) {
    this.newActivity.title = habito.title;
    this.newActivity.description = habito.description;
    this.newActivity.category = habito.category;
    this.newActivity.frequency = habito.frequency;
    this.newActivity.customDays = habito.customDays || [];
    this.newActivity.customDayOfMonth = habito.customDayOfMonth || 1;
    this.showAddActivity = true;
  }

  // Método para obtener próximas notificaciones del día (corregido)
  getUpcomingNotifications(): Array<{activity: Activity, schedule: HabitSchedule, timeUntil: string}> {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const upcoming = [];
    
    for (const activity of this.activities) {
      for (const schedule of activity.schedules) {
        if (schedule.notificationEnabled && schedule.time) {
          const [hours, minutes] = schedule.time.split(':').map(Number);
          const scheduleMinutes = hours * 60 + minutes;
          
          if (scheduleMinutes > currentMinutes) {
            const timeUntil = this.getTimeUntilText(scheduleMinutes - currentMinutes);
            upcoming.push({ activity, schedule, timeUntil });
          }
        }
      }
    }
    
    return upcoming.sort((a, b) => {
      if (!a.schedule.time || !b.schedule.time) return 0;
      const [aHours, aMinutes] = a.schedule.time.split(':').map(Number);
      const [bHours, bMinutes] = b.schedule.time.split(':').map(Number);
      return (aHours * 60 + aMinutes) - (bHours * 60 + bMinutes);
    }).slice(0, 3); // Mostrar solo las próximas 3
  }

  addActivity() {
    if (!this.newActivity.title.trim()) return;

    const activity: Activity = {
      id: Date.now().toString(),
      title: this.newActivity.title,
      description: this.newActivity.description,
      completed: false,
      createdAt: new Date(),
      frequency: this.newActivity.frequency,
      customDays: [...this.newActivity.customDays],
      customDayOfMonth: this.newActivity.customDayOfMonth,
      category: this.newActivity.category,
      streak: 0,
      completionHistory: [],
      schedules: this.newActivity.schedules.map(s => ({
        id: Date.now().toString() + Math.random(),
        time: s.time || undefined,
        timeOfDay: s.timeOfDay,
        notificationEnabled: s.notificationEnabled
      })),
      isEditing: false
    };

    this.activities.push(activity);
    this.saveActivities();
    this.resetForm();
    this.showAddActivity = false;
  }

  loadActivities() {
    const saved = localStorage.getItem('bienestar-activities');
    if (saved) {
      const activities = JSON.parse(saved);
      this.activities = activities.map((a: any) => ({
        ...a,
        createdAt: new Date(a.createdAt),
        completedAt: a.completedAt ? new Date(a.completedAt) : undefined,
        lastCompletedDate: a.lastCompletedDate ? new Date(a.lastCompletedDate) : undefined,
        completionHistory: (a.completionHistory || []).map((d: string) => new Date(d)),
        schedules: (a.schedules || []).map((s: any) => ({
          id: s.id || Date.now().toString() + Math.random(),
          time: s.time || undefined,
          timeOfDay: s.timeOfDay || 'morning',
          notificationEnabled: s.notificationEnabled !== false
        })),
        isEditing: false
      }));
    }
    this.updateStats();
  }

  private getTimeUntilText(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }
} (isChecked) {
      if (!this.editForm.customDays.includes(dayValue)) {
        this.editForm.customDays.push(dayValue);
      }
    } else {
      this.editForm.customDays = this.editForm.customDays.filter(d => d !== dayValue);
    }
  }

  // Método para trackBy en ngFor
  trackByActivityId(index: number, activity: Activity): string {
    return activity.id;
  }

  // Método para obtener próximas notificaciones del día
  getUpcomingNotifications(): Array<{activity: Activity, schedule: HabitSchedule, timeUntil: string}> {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const upcoming = [];
    
    for (const activity of this.activities) {
      for (const schedule of activity.schedules) {
        if (schedule.enabled && schedule.notificationEnabled) {
          const [hours, minutes] = schedule.time.split(':').map(Number);
          const scheduleMinutes = hours * 60 + minutes;
          
          if (scheduleMinutes > currentMinutes) {
            const timeUntil = this.getTimeUntilText(scheduleMinutes - currentMinutes);
            upcoming.push({ activity, schedule, timeUntil });
          }
        }
      }
    }
    
    return upcoming.sort((a, b) => {
      const [aHours, aMinutes] = a.schedule.time.split(':').map(Number);
      const [bHours, bMinutes] = b.schedule.time.split(':').map(Number);
      return (aHours * 60 + aMinutes) - (bHours * 60 + bMinutes);
    }).slice(0, 3); // Mostrar solo las próximas 3
  }

  private getTimeUntilText(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }
}